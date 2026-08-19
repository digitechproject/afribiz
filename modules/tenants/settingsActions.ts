"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/authz";
import { revalidatePath } from "next/cache";

export interface SettingsActionResponse {
  success: boolean;
  error?: string;
}

/**
 * Met à jour les informations de l'entreprise
 */
export async function updateCompanySettings(
  companySlug: string,
  data: {
    name?: string;
    legalName?: string;
    phone?: string;
    email?: string;
    city?: string;
    country?: string;
    address?: string;
    activityType?: string;
    legalForm?: string;
    formalizationLevel?: string;
    rccm?: string;
    companyIfu?: string;
    representativeName?: string;
    representativeIfu?: string;
    capitalSocial?: number;
    associatesCount?: number;
    primaryColor?: string;
    logo?: string;
  }
): Promise<SettingsActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    // Vérification déclarative d'autorisation via lib/authz
    const isAllowed = await can(session.userId, company.id, "SETTINGS", "UPDATE");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour modifier les paramètres de l'entreprise." };
    }

    await db.company.update({
      where: { id: company.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        legalName: data.legalName !== undefined ? data.legalName : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        email: data.email !== undefined ? data.email : undefined,
        city: data.city !== undefined ? data.city : undefined,
        country: data.country !== undefined ? data.country : undefined,
        address: data.address !== undefined ? data.address : undefined,
        activityType: data.activityType !== undefined ? data.activityType : undefined,
        legalForm: data.legalForm !== undefined ? data.legalForm : undefined,
        formalizationLevel: data.formalizationLevel !== undefined ? data.formalizationLevel : undefined,
        rccm: data.rccm !== undefined ? data.rccm : undefined,
        companyIfu: data.companyIfu !== undefined ? data.companyIfu : undefined,
        representativeName: data.representativeName !== undefined ? data.representativeName : undefined,
        representativeIfu: data.representativeIfu !== undefined ? data.representativeIfu : undefined,
        capitalSocial: data.capitalSocial !== undefined ? data.capitalSocial : undefined,
        associatesCount: data.associatesCount !== undefined ? data.associatesCount : undefined,
        primaryColor: data.primaryColor !== undefined ? data.primaryColor : undefined,
        logo: data.logo !== undefined ? data.logo : undefined,
      },
    });

    if (data.primaryColor || data.logo) {
      await db.tenantBranding.upsert({
        where: { companyId: company.id },
        update: {
          primaryColor: data.primaryColor || undefined,
          logoUrl: data.logo || undefined,
        },
        create: {
          companyId: company.id,
          primaryColor: data.primaryColor || "#0f766e",
          logoUrl: data.logo || null,
        },
      });
    }

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Update company settings error:", error);
    return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
  }
}

/**
 * Modifie le rôle d'un collaborateur
 */
export async function updateMemberRole(
  companySlug: string,
  targetUserId: string,
  newRoleId: string
): Promise<SettingsActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
      include: {
        memberships: true,
      },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    // Vérification de la permission de modification des rôles
    const isAllowed = await can(session.userId, company.id, "MEMBERS", "ROLE_CHANGE");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour modifier les rôles des membres." };
    }

    const currentMember = company.memberships.find((m) => m.userId === session.userId);
    if (!currentMember) {
      return { success: false, error: "Vous ne faites pas partie de cette entreprise." };
    }

    const targetMembership = company.memberships.find((m) => m.userId === targetUserId);
    if (!targetMembership) {
      return { success: false, error: "Collaborateur introuvable dans cette entreprise." };
    }

    // Seul un SUPER_ADMIN peut modifier un autre SUPER_ADMIN
    if (targetMembership.roleId === "SUPER_ADMIN" && currentMember.roleId !== "SUPER_ADMIN") {
      return { success: false, error: "Seul le propriétaire principal peut modifier un rôle Super Admin." };
    }

    // Empêcher de rétrograder le propriétaire principal de l'entreprise
    if (targetUserId === company.ownerUserId && newRoleId !== "SUPER_ADMIN") {
      return { success: false, error: "Le propriétaire principal de l'entreprise doit conserver le rôle Super Admin." };
    }

    // Si on rétrograde un SUPER_ADMIN, vérifier qu'il y en a un autre actif
    if (targetMembership.roleId === "SUPER_ADMIN" && newRoleId !== "SUPER_ADMIN") {
      const superAdminsCount = company.memberships.filter((m) => m.roleId === "SUPER_ADMIN" && m.status === "ACTIVE").length;
      if (superAdminsCount <= 1) {
        return { success: false, error: "Il doit y avoir au moins un Super Admin actif dans l'entreprise." };
      }
    }

    await db.membership.update({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId: company.id,
        },
      },
      data: {
        roleId: newRoleId,
      },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Update member role error:", error);
    return { success: false, error: "Erreur lors du changement de rôle." };
  }
}

/**
 * Révoque (supprime) l'accès d'un collaborateur à l'entreprise
 */
export async function revokeMembership(
  companySlug: string,
  targetUserId: string
): Promise<SettingsActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
      include: {
        memberships: true,
      },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    // Vérification de la permission de révocation
    const isAllowed = await can(session.userId, company.id, "MEMBERS", "REMOVE");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour révoquer un membre." };
    }

    const currentMember = company.memberships.find((m) => m.userId === session.userId);
    const targetMembership = company.memberships.find((m) => m.userId === targetUserId);
    if (!targetMembership) {
      return { success: false, error: "Collaborateur introuvable dans cette entreprise." };
    }

    // Seul un SUPER_ADMIN peut révoquer un autre SUPER_ADMIN
    if (targetMembership.roleId === "SUPER_ADMIN" && currentMember?.roleId !== "SUPER_ADMIN") {
      return { success: false, error: "Seul le propriétaire principal peut révoquer un Super Admin." };
    }

    // Impossible de se révoquer soi-même depuis cette action
    if (targetUserId === session.userId) {
      return { success: false, error: "Vous ne pouvez pas révoquer vos propres accès d'ici." };
    }

    // Impossible de révoquer le propriétaire principal de l'entreprise
    if (targetUserId === company.ownerUserId) {
      return { success: false, error: "Le propriétaire principal de l'entreprise ne peut pas être révoqué." };
    }

    await db.membership.delete({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId: company.id,
        },
      },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Revoke membership error:", error);
    return { success: false, error: "Erreur lors de la révocation du collaborateur." };
  }
}

/**
 * Annule une invitation en attente
 */
export async function cancelInvitation(
  companySlug: string,
  invitationId: string
): Promise<SettingsActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    const isAllowed = await can(session.userId, company.id, "MEMBERS", "INVITE");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour gérer les invitations." };
    }

    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.companyId !== company.id) {
      return { success: false, error: "Invitation introuvable." };
    }

    if (invitation.status !== "PENDING") {
      return { success: false, error: "L'invitation ne peut plus être annulée." };
    }

    await db.invitation.delete({
      where: { id: invitationId },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Cancel invitation error:", error);
    return { success: false, error: "Erreur lors de l'annulation de l'invitation." };
  }
}
