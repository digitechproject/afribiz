import { db } from "@/lib/db";

/**
 * Sous-domaines réservés pour le système, les API et les services transverses
 */
export const RESERVED_SUBDOMAINS = new Set([
  "api",
  "app",
  "admin",
  "auth",
  "billing",
  "cdn",
  "crm",
  "dashboard",
  "dev",
  "docs",
  "help",
  "mail",
  "portal",
  "root",
  "smtp",
  "staging",
  "static",
  "status",
  "support",
  "test",
  "webhook",
  "webhooks",
  "ws",
  "www",
]);

/**
 * Vérifie si un sous-domaine est réservé par le système
 */
export function isReservedSubdomain(subdomain: string): boolean {
  if (!subdomain) return true;
  const normalized = subdomain.toLowerCase().trim();
  return RESERVED_SUBDOMAINS.has(normalized);
}

/**
 * Analyse un hôte HTTP (Host header) pour extraire le contexte du tenant
 */
export function resolveTenantFromHost(
  hostHeader: string | null,
  configuredRootDomain?: string
): { isTenant: boolean; tenantSlug: string | null; isCustomDomain: boolean } {
  if (!hostHeader) {
    return { isTenant: false, tenantSlug: null, isCustomDomain: false };
  }

  // Nettoyage du port éventuel (ex: localhost:3000 -> localhost)
  const host = hostHeader.replace(/:[0-9]+$/, "").toLowerCase().trim();

  const isProd = process.env.NODE_ENV === "production";
  const rootDomain = (
    configuredRootDomain ||
    process.env.NEXT_PUBLIC_APP_DOMAIN ||
    (isProd ? "afribizsuite.com" : "localhost")
  ).toLowerCase().trim();

  // 1. Détection sous-domaine standard (ex: sofitarcom.afribizsuite.com ou sofitarcom.localhost)
  if (host.endsWith(`.${rootDomain}`) && host !== `www.${rootDomain}` && host !== rootDomain) {
    const subdomain = host.replace(`.${rootDomain}`, "").trim();
    if (subdomain && !isReservedSubdomain(subdomain)) {
      return { isTenant: true, tenantSlug: subdomain, isCustomDomain: false };
    }
    return { isTenant: false, tenantSlug: null, isCustomDomain: false };
  }

  // 2. Si l'hôte est exactement le domaine racine ou www
  if (host === rootDomain || host === `www.${rootDomain}`) {
    return { isTenant: false, tenantSlug: null, isCustomDomain: false };
  }

  // 3. Domaine personnalisé potentiel (ex: erp.maboutique.com)
  if (!host.endsWith(`.${rootDomain}`) && host !== "localhost" && host !== "127.0.0.1") {
    return { isTenant: true, tenantSlug: null, isCustomDomain: true };
  }

  return { isTenant: false, tenantSlug: null, isCustomDomain: false };
}

export interface TenantContext {
  company: {
    id: string;
    name: string;
    legalName: string | null;
    slug: string;
    subdomain: string | null;
    sector: string;
    primaryColor: string | null;
    logo: string | null;
    subscriptionPlan: string;
    status: string;
    onboardingCompleted: boolean;
  };
  membership: {
    id: string;
    roleId: string;
    status: string;
    position: string | null;
    department: string | null;
    allowedModules: string[];
    customPermissions: string[];
  };
}

/**
 * Récupère et valide le contexte complet d'un tenant pour un utilisateur connecté
 * Refuse l'accès si l'entreprise n'existe pas ou si le membre n'est pas "ACTIVE"
 */
export async function getTenantContext(
  companySlug: string,
  userId: string
): Promise<TenantContext | null> {
  if (!companySlug || !userId) return null;

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
      include: {
        branding: true,
        memberships: {
          where: {
            userId,
            status: "ACTIVE",
          },
        },
      },
    });

    if (!company || company.status !== "ACTIVE" || company.memberships.length === 0) {
      return null;
    }

    const membership = company.memberships[0];

    return {
      company: {
        id: company.id,
        name: company.name,
        legalName: company.legalName,
        slug: company.slug,
        subdomain: company.subdomain,
        sector: company.sector,
        primaryColor: company.branding?.primaryColor || company.primaryColor,
        logo: company.branding?.logoUrl || company.logo,
        subscriptionPlan: company.subscriptionPlan,
        status: company.status,
        onboardingCompleted: company.onboardingCompleted,
      },
      membership: {
        id: membership.id,
        roleId: membership.roleId,
        status: membership.status,
        position: membership.position,
        department: membership.department,
        allowedModules: membership.allowedModules,
        customPermissions: membership.customPermissions,
      },
    };
  } catch (err) {
    console.error("Erreur lors de la récupération du contexte tenant:", err);
    return null;
  }
}
