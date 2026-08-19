"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/authz";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export interface HrActionResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

// ==========================================
// 1. GESTION DES DÉPARTEMENTS
// ==========================================

export async function createDepartment(
  companySlug: string,
  name: string
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  if (!name || name.trim().length < 2) {
    return { success: false, error: "Le nom du département est requis (min 2 caractères)." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    const isAllowed = await can(session.userId, company.id, "HR", "DEPARTMENTS_MANAGE");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour gérer les départements." };
    }

    const department = await db.companyDepartment.create({
      data: {
        companyId: company.id,
        name: name.trim(),
        status: "ACTIVE",
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_DEPARTMENT_CREATED",
      entity: "DEPARTMENT",
      entityId: department.id,
      metadata: { name: department.name },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true, data: department };
  } catch (error) {
    console.error("Create department error:", error);
    return { success: false, error: "Erreur lors de la création du département." };
  }
}

export async function updateDepartment(
  companySlug: string,
  departmentId: string,
  name: string,
  status?: string
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  try {
    const company = await db.company.findUnique({ where: { slug: companySlug } });
    if (!company) return { success: false, error: "Workspace introuvable." };

    const isAllowed = await can(session.userId, company.id, "HR", "DEPARTMENTS_MANAGE");
    if (!isAllowed) return { success: false, error: "Droits insuffisants." };

    const department = await db.companyDepartment.findUnique({ where: { id: departmentId } });
    if (!department || department.companyId !== company.id) {
      return { success: false, error: "Département introuvable." };
    }

    const updated = await db.companyDepartment.update({
      where: { id: departmentId },
      data: {
        name: name.trim(),
        status: status || department.status,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_DEPARTMENT_UPDATED",
      entity: "DEPARTMENT",
      entityId: department.id,
      metadata: { oldName: department.name, newName: updated.name },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Update department error:", error);
    return { success: false, error: "Erreur lors de la modification du département." };
  }
}

export async function deleteDepartment(
  companySlug: string,
  departmentId: string
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  try {
    const company = await db.company.findUnique({ where: { slug: companySlug } });
    if (!company) return { success: false, error: "Workspace introuvable." };

    const isAllowed = await can(session.userId, company.id, "HR", "DEPARTMENTS_MANAGE");
    if (!isAllowed) return { success: false, error: "Droits insuffisants." };

    const department = await db.companyDepartment.findUnique({ where: { id: departmentId } });
    if (!department || department.companyId !== company.id) {
      return { success: false, error: "Département introuvable." };
    }

    // Désassocier les postes de ce département avant suppression
    await db.companyPosition.updateMany({
      where: { departmentId },
      data: { departmentId: null },
    });

    await db.companyDepartment.delete({
      where: { id: departmentId },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_DEPARTMENT_DELETED",
      entity: "DEPARTMENT",
      entityId: departmentId,
      metadata: { name: department.name },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Delete department error:", error);
    return { success: false, error: "Erreur lors de la suppression du département." };
  }
}

// ==========================================
// 2. GESTION DES POSTES
// ==========================================

export async function createPosition(
  companySlug: string,
  data: {
    name: string;
    departmentId?: string | null;
    recommendedRoleId?: string | null;
    recommendedContractType?: string | null;
    recommendedPermissions?: string[];
  }
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  if (!data.name || data.name.trim().length < 2) {
    return { success: false, error: "L'intitulé du poste est requis." };
  }

  try {
    const company = await db.company.findUnique({ where: { slug: companySlug } });
    if (!company) return { success: false, error: "Workspace introuvable." };

    const isAllowed = await can(session.userId, company.id, "HR", "POSITIONS_MANAGE");
    if (!isAllowed) return { success: false, error: "Droits insuffisants pour gérer les postes." };

    const position = await db.companyPosition.create({
      data: {
        companyId: company.id,
        name: data.name.trim(),
        departmentId: data.departmentId || null,
        recommendedRoleId: data.recommendedRoleId || "COLLABORATOR",
        recommendedContractType: data.recommendedContractType || null,
        recommendedPermissions: data.recommendedPermissions || [],
        status: "ACTIVE",
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_POSITION_CREATED",
      entity: "POSITION",
      entityId: position.id,
      metadata: { name: position.name, departmentId: position.departmentId },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true, data: position };
  } catch (error) {
    console.error("Create position error:", error);
    return { success: false, error: "Erreur lors de la création de la fiche de poste." };
  }
}

export async function updatePosition(
  companySlug: string,
  positionId: string,
  data: {
    name?: string;
    departmentId?: string | null;
    recommendedRoleId?: string | null;
    recommendedContractType?: string | null;
    recommendedPermissions?: string[];
    status?: string;
  }
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  try {
    const company = await db.company.findUnique({ where: { slug: companySlug } });
    if (!company) return { success: false, error: "Workspace introuvable." };

    const isAllowed = await can(session.userId, company.id, "HR", "POSITIONS_MANAGE");
    if (!isAllowed) return { success: false, error: "Droits insuffisants." };

    const position = await db.companyPosition.findUnique({ where: { id: positionId } });
    if (!position || position.companyId !== company.id) {
      return { success: false, error: "Poste introuvable." };
    }

    const updated = await db.companyPosition.update({
      where: { id: positionId },
      data: {
        name: data.name ? data.name.trim() : position.name,
        departmentId: data.departmentId !== undefined ? data.departmentId : position.departmentId,
        recommendedRoleId: data.recommendedRoleId || position.recommendedRoleId,
        recommendedContractType: data.recommendedContractType || position.recommendedContractType,
        recommendedPermissions: data.recommendedPermissions || position.recommendedPermissions,
        status: data.status || position.status,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_POSITION_UPDATED",
      entity: "POSITION",
      entityId: position.id,
      metadata: { name: updated.name },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Update position error:", error);
    return { success: false, error: "Erreur lors de la modification du poste." };
  }
}

export async function deletePosition(
  companySlug: string,
  positionId: string
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  try {
    const company = await db.company.findUnique({ where: { slug: companySlug } });
    if (!company) return { success: false, error: "Workspace introuvable." };

    const isAllowed = await can(session.userId, company.id, "HR", "POSITIONS_MANAGE");
    if (!isAllowed) return { success: false, error: "Droits insuffisants." };

    const position = await db.companyPosition.findUnique({ where: { id: positionId } });
    if (!position || position.companyId !== company.id) {
      return { success: false, error: "Poste introuvable." };
    }

    await db.companyPosition.delete({
      where: { id: positionId },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_POSITION_DELETED",
      entity: "POSITION",
      entityId: positionId,
      metadata: { name: position.name },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Delete position error:", error);
    return { success: false, error: "Erreur lors de la suppression du poste." };
  }
}

// ==========================================
// 3. GESTION DU CYCLE RH DES COLLABORATEURS
// ==========================================

export async function updateMemberHrProfile(
  companySlug: string,
  targetUserId: string,
  data: {
    position?: string | null;
    department?: string | null;
    collaborationStatus?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    managerId?: string | null;
    allowedModules?: string[];
    customPermissions?: string[];
  }
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  try {
    const company = await db.company.findUnique({ where: { slug: companySlug } });
    if (!company) return { success: false, error: "Workspace introuvable." };

    const isAllowed = await can(session.userId, company.id, "MEMBERS", "UPDATE");
    if (!isAllowed) return { success: false, error: "Droits insuffisants pour modifier le profil collaborateur." };

    const membership = await db.membership.findUnique({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId: company.id,
        },
      },
    });

    if (!membership) {
      return { success: false, error: "Collaborateur introuvable dans cette entreprise." };
    }

    const updated = await db.membership.update({
      where: { id: membership.id },
      data: {
        position: data.position !== undefined ? data.position : membership.position,
        department: data.department !== undefined ? data.department : membership.department,
        collaborationStatus: data.collaborationStatus || membership.collaborationStatus,
        startDate: data.startDate ? new Date(data.startDate) : membership.startDate,
        endDate: data.endDate ? new Date(data.endDate) : membership.endDate,
        managerId: data.managerId !== undefined ? data.managerId : membership.managerId,
        allowedModules: data.allowedModules || membership.allowedModules,
        customPermissions: data.customPermissions || membership.customPermissions,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_MEMBER_PROFILE_UPDATED",
      entity: "MEMBERSHIP",
      entityId: membership.id,
      metadata: { targetUserId, position: updated.position, department: updated.department },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Update member HR profile error:", error);
    return { success: false, error: "Erreur lors de la mise à jour du profil RH." };
  }
}

export async function offboardMember(
  companySlug: string,
  targetUserId: string,
  reason?: string
): Promise<HrActionResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  try {
    const company = await db.company.findUnique({ where: { slug: companySlug } });
    if (!company) return { success: false, error: "Workspace introuvable." };

    const isAllowed = await can(session.userId, company.id, "MEMBERS", "REMOVE");
    if (!isAllowed) return { success: false, error: "Droits insuffisants pour offboarder un collaborateur." };

    if (targetUserId === company.ownerUserId) {
      return { success: false, error: "Le propriétaire principal ne peut pas être offboardé." };
    }

    const membership = await db.membership.findUnique({
      where: {
        userId_companyId: {
          userId: targetUserId,
          companyId: company.id,
        },
      },
    });

    if (!membership) {
      return { success: false, error: "Collaborateur introuvable." };
    }

    // Basculer l'adhésion en statut INACTIVE (historique préservé, accès révoqué)
    await db.membership.update({
      where: { id: membership.id },
      data: {
        status: "INACTIVE",
        endDate: new Date(),
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "HR_MEMBER_OFFBOARDED",
      entity: "MEMBERSHIP",
      entityId: membership.id,
      metadata: { targetUserId, reason: reason || "Fin de collaboration" },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Offboard member error:", error);
    return { success: false, error: "Erreur lors de l'offboarding du collaborateur." };
  }
}
