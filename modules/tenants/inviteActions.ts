"use server";

import { db } from "@/lib/db";
import { getSession, createSession } from "@/lib/auth";
import { can } from "@/lib/authz";
import { hashPassword } from "@/lib/crypto";
import { sendMail } from "@/lib/email/provider";
import { createInvitationEmail } from "@/lib/email/templates/authTemplates";
import { logAuditEvent } from "@/lib/audit";
import { randomUUID } from "crypto";

export interface InviteResponse {
  success: boolean;
  error?: string;
  userExists?: boolean;
  companyName?: string;
  roleId?: string;
  redirectTo?: string;
}

export async function inviteCollaborator(
  companySlug: string,
  email: string,
  roleId: string,
  details?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    position?: string;
    department?: string;
    collaborationStatus?: string;
    allowedModules?: string[];
    permissions?: string[];
    startDate?: string;
    endDate?: string;
    managerId?: string;
    contractType?: string;
    message?: string;
  }
): Promise<InviteResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  if (!email || !roleId) {
    return { success: false, error: "Email et rôle obligatoires." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    // Vérification de la permission d'invitation
    const isAllowed = await can(session.userId, company.id, "MEMBERS", "INVITE");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour inviter un collaborateur." };
    }

    // Vérifier si l'utilisateur est déjà membre actif
    const existingMember = await db.user.findFirst({
      where: {
        email,
        memberships: {
          some: {
            companyId: company.id,
            status: "ACTIVE",
          },
        },
      },
    });

    if (existingMember) {
      return { success: false, error: "Cet utilisateur fait déjà partie de l'entreprise." };
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const invitation = await db.invitation.create({
      data: {
        email,
        companyId: company.id,
        roleId,
        token,
        expiresAt,
        firstName: details?.firstName || null,
        lastName: details?.lastName || null,
        phone: details?.phone || null,
        position: details?.position || null,
        department: details?.department || null,
        collaborationStatus: details?.collaborationStatus || null,
        allowedModules: details?.allowedModules || [],
        permissions: details?.permissions || [],
        startDate: details?.startDate ? new Date(details.startDate) : null,
        endDate: details?.endDate ? new Date(details.endDate) : null,
        managerId: details?.managerId || null,
        contractType: details?.contractType || null,
        message: details?.message || null,
      },
    });

    const isProd = process.env.NODE_ENV === "production";
    const rootDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || (isProd ? "afribizsuite.com" : "localhost:3000");
    const protocol = isProd ? "https" : "http";
    const acceptUrl = `${protocol}://${rootDomain}/invitation/accept?token=${token}`;

    const role = await db.role.findUnique({ where: { id: roleId } });
    const roleName = role?.name || roleId;

    await sendMail(
      createInvitationEmail({
        to: email,
        companyName: company.name,
        roleName,
        acceptUrl,
        inviterName: `${session.firstName} ${session.lastName}`,
      })
    );

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "MEMBERSHIP_INVITATION_SENT",
      entity: "INVITATION",
      entityId: invitation.id,
      metadata: { email, roleId, position: details?.position, department: details?.department },
    });

    return { success: true };
  } catch (error) {
    console.error("Invite collaborator error:", error);
    return { success: false, error: "Une erreur est survenue lors de l'invitation." };
  }
}

export async function acceptInvitation(
  token: string,
  registrationData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
  }
): Promise<InviteResponse> {
  if (!token) {
    return { success: false, error: "Token d'invitation manquant." };
  }

  try {
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { company: true },
    });

    if (!invitation || invitation.status !== "PENDING") {
      return { success: false, error: "Invitation invalide ou déjà acceptée." };
    }

    if (new Date() > invitation.expiresAt) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "Cette invitation a expiré." };
    }

    const session = await getSession();

    if (session) {
      const user = await db.user.findUnique({
        where: { id: session.userId },
      });

      if (!user) {
        return { success: false, error: "Session utilisateur invalide." };
      }

      // Vérifier si une adhésion existe déjà
      const existingMembership = await db.membership.findUnique({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId: invitation.companyId,
          },
        },
      });

      let membershipId: string;
      if (!existingMembership) {
        const created = await db.membership.create({
          data: {
            userId: user.id,
            companyId: invitation.companyId,
            roleId: invitation.roleId,
            status: "ACTIVE",
            position: invitation.position,
            department: invitation.department,
            collaborationStatus: invitation.collaborationStatus,
            startDate: invitation.startDate,
            endDate: invitation.endDate,
            managerId: invitation.managerId,
            allowedModules: invitation.allowedModules,
            customPermissions: invitation.permissions,
          },
        });
        membershipId = created.id;
      } else {
        const updated = await db.membership.update({
          where: { id: existingMembership.id },
          data: {
            status: "ACTIVE",
            roleId: invitation.roleId,
            position: invitation.position || existingMembership.position,
            department: invitation.department || existingMembership.department,
          },
        });
        membershipId = updated.id;
      }

      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      await logAuditEvent({
        userId: user.id,
        companyId: invitation.companyId,
        action: "MEMBERSHIP_INVITATION_ACCEPTED",
        entity: "MEMBERSHIP",
        entityId: membershipId,
      });

      return {
        success: true,
        redirectTo: `/app/${invitation.company.slug}/dashboard`,
      };
    }

    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return {
        success: true,
        userExists: true,
        companyName: invitation.company.name,
        roleId: invitation.roleId,
      };
    }

    if (registrationData) {
      const { firstName, lastName, phone, password } = registrationData;

      if (!firstName || !lastName || !phone || !password) {
        return { success: false, error: "Tous les champs d'inscription sont requis." };
      }

      const hashedPassword = hashPassword(password);

      const newUser = await db.user.create({
        data: {
          firstName,
          lastName,
          email: invitation.email,
          phone,
          password: hashedPassword,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
      });

      const membership = await db.membership.create({
        data: {
          userId: newUser.id,
          companyId: invitation.companyId,
          roleId: invitation.roleId,
          status: "ACTIVE",
          position: invitation.position,
          department: invitation.department,
          collaborationStatus: invitation.collaborationStatus,
          startDate: invitation.startDate,
          endDate: invitation.endDate,
          managerId: invitation.managerId,
          allowedModules: invitation.allowedModules,
          customPermissions: invitation.permissions,
        },
      });

      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      await createSession({
        userId: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        activeCompanyId: invitation.companyId,
        activeCompanySlug: invitation.company.slug,
        activeRole: invitation.roleId,
      });

      await logAuditEvent({
        userId: newUser.id,
        companyId: invitation.companyId,
        action: "MEMBERSHIP_REGISTER_AND_ACCEPT",
        entity: "MEMBERSHIP",
        entityId: membership.id,
      });

      return {
        success: true,
        redirectTo: `/app/${invitation.company.slug}/dashboard`,
      };
    }

    return {
      success: true,
      userExists: false,
      companyName: invitation.company.name,
      roleId: invitation.roleId,
    };
  } catch (error) {
    console.error("Accept invitation error:", error);
    return { success: false, error: "Une erreur est survenue lors de l'acceptation." };
  }
}
