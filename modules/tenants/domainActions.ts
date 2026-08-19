"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/authz";
import { logAuditEvent } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export interface DomainActionResponse {
  success: boolean;
  error?: string;
  domain?: unknown;
}

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

/**
 * Associe un nouveau nom de domaine personnalisé à une entreprise
 */
export async function addCustomDomain(
  companySlug: string,
  domainInput: string
): Promise<DomainActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  if (!domainInput) {
    return { success: false, error: "Le nom de domaine est requis." };
  }

  const cleanDomain = domainInput.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  if (!DOMAIN_REGEX.test(cleanDomain)) {
    return { success: false, error: "Format de nom de domaine invalide (ex: erp.maboutique.com)." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    const isAllowed = await can(session.userId, company.id, "SETTINGS", "DOMAINS");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour gérer les domaines personnalisés." };
    }

    // Vérifier si le domaine est déjà associé
    const existing = await db.customDomain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      return { success: false, error: "Ce domaine est déjà configuré dans le système." };
    }

    const verificationCode = `afribiz-verify-${randomUUID().substring(0, 12)}`;

    const customDomain = await db.customDomain.create({
      data: {
        companyId: company.id,
        domain: cleanDomain,
        status: "PENDING_VERIFICATION",
        verificationCode,
        sslStatus: "PENDING",
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "DOMAIN_ADDED",
      entity: "CUSTOM_DOMAIN",
      entityId: customDomain.id,
      metadata: { domain: cleanDomain },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true, domain: customDomain };
  } catch (error) {
    console.error("Add custom domain error:", error);
    return { success: false, error: "Une erreur est survenue lors de l'ajout du domaine." };
  }
}

/**
 * Lance la vérification DNS pour activer le domaine personnalisé
 */
export async function verifyCustomDomain(
  companySlug: string,
  domainId: string
): Promise<DomainActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    const isAllowed = await can(session.userId, company.id, "SETTINGS", "DOMAINS");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants pour gérer les domaines." };
    }

    const customDomain = await db.customDomain.findUnique({
      where: { id: domainId },
    });

    if (!customDomain || customDomain.companyId !== company.id) {
      return { success: false, error: "Domaine introuvable." };
    }

    // Simulation de la vérification DNS & génération certificat SSL automatique
    const updated = await db.customDomain.update({
      where: { id: domainId },
      data: {
        status: "ACTIVE",
        sslStatus: "ACTIVE",
      },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "DOMAIN_VERIFIED_ACTIVE",
      entity: "CUSTOM_DOMAIN",
      entityId: customDomain.id,
      metadata: { domain: customDomain.domain },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true, domain: updated };
  } catch (error) {
    console.error("Verify custom domain error:", error);
    return { success: false, error: "Erreur lors de la vérification DNS du domaine." };
  }
}

/**
 * Supprime un domaine personnalisé associé
 */
export async function removeCustomDomain(
  companySlug: string,
  domainId: string
): Promise<DomainActionResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé." };
  }

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company) {
      return { success: false, error: "Workspace introuvable." };
    }

    const isAllowed = await can(session.userId, company.id, "SETTINGS", "DOMAINS");
    if (!isAllowed) {
      return { success: false, error: "Droits insuffisants." };
    }

    const customDomain = await db.customDomain.findUnique({
      where: { id: domainId },
    });

    if (!customDomain || customDomain.companyId !== company.id) {
      return { success: false, error: "Domaine introuvable." };
    }

    await db.customDomain.delete({
      where: { id: domainId },
    });

    await logAuditEvent({
      userId: session.userId,
      companyId: company.id,
      action: "DOMAIN_REMOVED",
      entity: "CUSTOM_DOMAIN",
      entityId: domainId,
      metadata: { domain: customDomain.domain },
    });

    revalidatePath(`/app/${companySlug}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Remove custom domain error:", error);
    return { success: false, error: "Erreur lors de la suppression du domaine." };
  }
}
