"use server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { revokeUserSessions } from "@/lib/auth";
import { sendMail } from "@/lib/email/provider";
import { createPasswordResetEmail } from "@/lib/email/templates/authTemplates";
import { logAuditEvent } from "@/lib/audit";
import { randomUUID } from "crypto";

export interface ResetResponse {
  success: boolean;
  error?: string;
}

export async function requestPasswordReset(email: string): Promise<ResetResponse> {
  if (!email) {
    return { success: false, error: "L'adresse email est requise." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    // Sécurité : Réponse opaque pour ne pas divulguer l'existence des emails
    if (!user) {
      return { success: true };
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure de validité

    await db.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const isProd = process.env.NODE_ENV === "production";
    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || (isProd ? "afribizsuite.com" : "localhost:3000");
    const protocol = isProd ? "https" : "http";
    const resetUrl = `${protocol}://${domain}/reset-password?token=${token}`;

    await sendMail(
      createPasswordResetEmail({
        to: email,
        resetUrl,
        recipientName: `${user.firstName} ${user.lastName}`,
      })
    );

    await logAuditEvent({
      userId: user.id,
      action: "AUTH_PASSWORD_RESET_REQUEST",
      entity: "USER",
      entityId: user.id,
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: "Une erreur est survenue lors de la demande." };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetResponse> {
  if (!token || !newPassword) {
    return { success: false, error: "Données manquantes." };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Le mot de passe doit faire au moins 8 caractères." };
  }

  try {
    // Recherche d'un jeton valide
    const reset = await db.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!reset || reset.status !== "PENDING") {
      return { success: false, error: "Lien de réinitialisation invalide ou déjà utilisé." };
    }

    if (new Date() > reset.expiresAt) {
      await db.passwordReset.update({
        where: { id: reset.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "Ce lien de réinitialisation a expiré." };
    }

    const hashedPassword = hashPassword(newPassword);

    // Mise à jour du mot de passe
    await db.user.update({
      where: { id: reset.userId },
      data: { password: hashedPassword },
    });

    // Révocation de toutes les sessions actives de l'utilisateur par mesure de sécurité
    await revokeUserSessions(reset.userId);

    // Marquer le jeton comme utilisé
    await db.passwordReset.update({
      where: { id: reset.id },
      data: { status: "USED" },
    });

    await logAuditEvent({
      userId: reset.userId,
      action: "AUTH_PASSWORD_RESET_SUCCESS",
      entity: "USER",
      entityId: reset.userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Password reset execution error:", error);
    return { success: false, error: "Une erreur est survenue lors de la réinitialisation." };
  }
}
