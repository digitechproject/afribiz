"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { hashPassword, verifyPasswordDetails } from "@/lib/crypto";
import { createSession, destroySession, getSession } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";
import { getCompanyUrl } from "@/lib/url";
import { sendMail } from "@/lib/email/provider";
import { createOtpEmail } from "@/lib/email/templates/authTemplates";
import { logAuditEvent } from "@/lib/audit";

export interface ActionResponse {
  success: boolean;
  error?: string;
  userId?: string;
  redirectTo?: string;
}

export async function registerUser(prevState: unknown, formData: FormData): Promise<ActionResponse> {
  const rawFields = Object.fromEntries(formData.entries());

  const validation = registerSchema.safeParse(rawFields);
  if (!validation.success) {
    const errorMap = validation.error.flatten().fieldErrors;
    const firstError = Object.values(errorMap)[0]?.[0];
    return { success: false, error: firstError || "Données invalides" };
  }

  const { firstName, lastName, email, phone, password, ifu, city, country } = validation.data;

  try {
    // Vérification de l'unicité de l'email et du téléphone
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Un utilisateur avec cet email ou ce téléphone existe déjà.",
      };
    }

    const hashedPassword = hashPassword(password);

    // Création du compte en statut PENDING (validation par code requise)
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        status: "PENDING",
        ifu: ifu || null,
        city,
        country,
      },
    });

    // Génération du code OTP sécurisé à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.oTPCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
      },
    });

    // Envoi de l'email transactionnel OTP
    await sendMail(
      createOtpEmail({
        to: email,
        code: otpCode,
        recipientName: `${firstName} ${lastName}`,
      })
    );

    await logAuditEvent({
      userId: user.id,
      action: "AUTH_REGISTER",
      entity: "USER",
      entityId: user.id,
      metadata: { email, phone },
    });

    return {
      success: true,
      userId: user.id,
      redirectTo: `/verify-account?userId=${user.id}`,
    };
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return { success: false, error: "Une erreur est survenue lors de l'inscription." };
  }
}

export async function verifyOTP(userId: string, code: string): Promise<ActionResponse> {
  if (!userId || !code) {
    return { success: false, error: "Paramètres manquants." };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé." };
    }

    // Récupération du dernier code OTP en attente
    const otp = await db.oTPCode.findFirst({
      where: {
        userId,
        code,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return { success: false, error: "Code de vérification incorrect." };
    }

    if (new Date() > otp.expiresAt) {
      await db.oTPCode.update({
        where: { id: otp.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "Le code a expiré. Veuillez en demander un nouveau." };
    }

    // Marquer l'OTP comme validé et activer l'utilisateur
    await db.oTPCode.update({
      where: { id: otp.id },
      data: { status: "VERIFIED" },
    });

    const now = new Date();
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        emailVerifiedAt: now,
        phoneVerifiedAt: now,
      },
    });

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;

    // Créer la session authentifiée
    await createSession(
      {
        userId: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
      { ipAddress, userAgent }
    );

    await logAuditEvent({
      userId: updatedUser.id,
      action: "AUTH_OTP_VERIFIED",
      entity: "USER",
      entityId: updatedUser.id,
      ipAddress,
      userAgent,
    });

    return { success: true, redirectTo: "/select-workspace" };
  } catch (error) {
    console.error("OTP verification error:", error);
    return { success: false, error: "Une erreur est survenue lors de la vérification." };
  }
}

export async function loginUser(prevState: unknown, formData: FormData): Promise<ActionResponse> {
  const rawFields = Object.fromEntries(formData.entries());

  const validation = loginSchema.safeParse(rawFields);
  if (!validation.success) {
    return { success: false, error: "Identifiants invalides." };
  }

  const { identifier, password } = validation.data;
  const tenantSlug = formData.get("tenantSlug") as string | null;

  try {
    // Recherche par email ou numéro de téléphone
    const user = await db.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        memberships: {
          where: {
            status: "ACTIVE",
          },
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Identifiants incorrects." };
    }

    const verification = verifyPasswordDetails(password, user.password);
    if (!verification.valid) {
      return { success: false, error: "Identifiants incorrects." };
    }

    // Migration transparente du mot de passe vers le nouveau hashage scrypt sécurisé si nécessaire
    if (verification.needsRehash) {
      try {
        const upgradedHash = hashPassword(password);
        await db.user.update({
          where: { id: user.id },
          data: { password: upgradedHash },
        });
      } catch (err) {
        console.error("Erreur lors de la mise à niveau transparente du hash mot de passe:", err);
      }
    }

    // Gestion du statut du compte
    if (user.status === "PENDING") {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db.oTPCode.create({
        data: {
          userId: user.id,
          code: otpCode,
          expiresAt,
        },
      });

      await sendMail(
        createOtpEmail({
          to: user.email,
          code: otpCode,
          recipientName: `${user.firstName} ${user.lastName}`,
        })
      );

      return {
        success: true,
        userId: user.id,
        redirectTo: `/verify-account?userId=${user.id}`,
      };
    }

    if (user.status === "SUSPENDED") {
      return { success: false, error: "Votre compte est suspendu. Veuillez contacter l'administrateur." };
    }

    // Contexte d'entreprise actif
    let activeCompanyId: string | undefined;
    let activeCompanySlug: string | undefined;
    let activeRole: string | undefined;
    let redirectTo = "/select-workspace";

    if (tenantSlug) {
      const tenantMembership = user.memberships.find((m) => m.company.slug === tenantSlug);
      if (!tenantMembership) {
        return { success: false, error: "Vous ne disposez pas d'un accès actif à cet espace entreprise." };
      }
      activeCompanyId = tenantMembership.companyId;
      activeCompanySlug = tenantMembership.company.slug;
      activeRole = tenantMembership.roleId;
      redirectTo = "/dashboard";
    } else if (user.memberships.length === 1) {
      const membership = user.memberships[0];
      activeCompanyId = membership.companyId;
      activeCompanySlug = membership.company.slug;
      activeRole = membership.roleId;
      redirectTo = getCompanyUrl(membership.company.slug, "/dashboard");
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || undefined;

    // Création de la session
    await createSession(
      {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        activeCompanyId,
        activeCompanySlug,
        activeRole,
      },
      { ipAddress, userAgent }
    );

    await logAuditEvent({
      userId: user.id,
      companyId: activeCompanyId || null,
      action: "AUTH_LOGIN",
      entity: "USER",
      entityId: user.id,
      ipAddress,
      userAgent,
      metadata: { activeCompanySlug, activeRole },
    });

    return { success: true, redirectTo };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Une erreur est survenue lors de la connexion." };
  }
}

export async function logoutUser() {
  const session = await getSession();
  if (session) {
    await logAuditEvent({
      userId: session.userId,
      companyId: session.activeCompanyId || null,
      action: "AUTH_LOGOUT",
      entity: "USER",
      entityId: session.userId,
    });
  }
  await destroySession();
  redirect("/login");
}

export async function updateUserIfu(ifu: string): Promise<ActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé." };
  }

  if (!ifu || ifu.trim().length < 3) {
    return { success: false, error: "Veuillez entrer un IFU valide." };
  }

  try {
    await db.user.update({
      where: { id: session.userId },
      data: { ifu },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "USER_IFU_UPDATE",
      entity: "USER",
      entityId: session.userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Update IFU error:", error);
    return { success: false, error: "Erreur lors de l'enregistrement de l'IFU." };
  }
}
