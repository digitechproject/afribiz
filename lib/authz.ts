import { db } from "@/lib/db";

/**
 * Catalogue standard des modules AfriBiz Suite
 */
export const SYSTEM_MODULES = [
  "SETTINGS",
  "MEMBERS",
  "DOCUMENTS",
  "HR",
  "BILLING",
  "CLIENTS",
  "PROJECTS",
] as const;

export type SystemModule = (typeof SYSTEM_MODULES)[number];

/**
 * Catalogue standard des permissions système
 */
export const DEFAULT_PERMISSIONS: {
  code: string;
  name: string;
  module: SystemModule;
  description: string;
}[] = [
  // Paramètres & Organisation
  { code: "SETTINGS_VIEW", name: "Consulter les paramètres", module: "SETTINGS", description: "Peut voir les réglages de l'entreprise" },
  { code: "SETTINGS_UPDATE", name: "Modifier les paramètres", module: "SETTINGS", description: "Peut modifier les informations de l'entreprise" },
  { code: "SETTINGS_BRANDING", name: "Gérer l'apparence et le branding", module: "SETTINGS", description: "Peut personnaliser les couleurs et logos" },
  { code: "SETTINGS_DOMAINS", name: "Gérer les domaines personnalisés", module: "SETTINGS", description: "Peut ajouter et configurer des domaines" },

  // Gestion des membres et collaborateurs
  { code: "MEMBERS_VIEW", name: "Voir la liste des membres", module: "MEMBERS", description: "Peut voir l'annuaire des membres de l'entreprise" },
  { code: "MEMBERS_INVITE", name: "Inviter des membres", module: "MEMBERS", description: "Peut envoyer des invitations à de nouveaux collaborateurs" },
  { code: "MEMBERS_UPDATE", name: "Modifier les profils membres", module: "MEMBERS", description: "Peut modifier le département ou le poste d'un membre" },
  { code: "MEMBERS_ROLE_CHANGE", name: "Changer le rôle d'un membre", module: "MEMBERS", description: "Peut modifier le rôle hiérarchique d'un collaborateur" },
  { code: "MEMBERS_REMOVE", name: "Retirer un membre", module: "MEMBERS", description: "Peut désactiver ou retirer un collaborateur de l'espace" },

  // Documents
  { code: "DOCUMENTS_VIEW", name: "Consulter les documents", module: "DOCUMENTS", description: "Peut lire et télécharger les documents autorisés" },
  { code: "DOCUMENTS_CREATE", name: "Créer des documents", module: "DOCUMENTS", description: "Peut téléverser ou générer de nouveaux documents" },
  { code: "DOCUMENTS_UPDATE", name: "Modifier des documents", module: "DOCUMENTS", description: "Peut modifier les métadonnées de documents" },
  { code: "DOCUMENTS_DELETE", name: "Supprimer des documents", module: "DOCUMENTS", description: "Peut archiver ou supprimer des documents" },
  { code: "DOCUMENTS_SHARE", name: "Partager des documents", module: "DOCUMENTS", description: "Peut générer des liens sécurisés de partage" },

  // Ressources Humaines
  { code: "HR_DEPARTMENTS_MANAGE", name: "Gérer les départements", module: "HR", description: "Peut créer, renommer et organiser les services" },
  { code: "HR_POSITIONS_MANAGE", name: "Gérer les postes", module: "HR", description: "Peut créer et configurer les fiches de postes" },
  { code: "HR_CONTRACTS_MANAGE", name: "Gérer les contrats RH", module: "HR", description: "Peut créer et administrer les contrats de travail" },
  { code: "HR_SALARY_VIEW", name: "Consulter les salaires", module: "HR", description: "Accès aux informations financières de rémunération" },

  // Facturation et Comptabilité
  { code: "BILLING_VIEW", name: "Consulter la facturation", module: "BILLING", description: "Peut voir l'historique de facturation et abonnement" },
  { code: "BILLING_MANAGE", name: "Gérer l'abonnement", module: "BILLING", description: "Peut modifier le plan ou les moyens de paiement" },
  { code: "INVOICES_VIEW", name: "Consulter les factures clients", module: "BILLING", description: "Peut voir les factures émises aux clients" },
  { code: "INVOICES_CREATE", name: "Émettre des factures", module: "BILLING", description: "Peut créer des devis et factures" },

  // Clients et CRM
  { code: "CLIENTS_VIEW", name: "Consulter le répertoire clients", module: "CLIENTS", description: "Peut voir la liste des clients et contacts" },
  { code: "CLIENTS_CREATE", name: "Ajouter des clients", module: "CLIENTS", description: "Peut créer de nouveaux clients" },
  { code: "CLIENTS_UPDATE", name: "Modifier des clients", module: "CLIENTS", description: "Peut éditer les informations clients" },
  { code: "CLIENTS_DELETE", name: "Supprimer des clients", module: "CLIENTS", description: "Peut archiver des fiches clients" },

  // Projets et Tâches
  { code: "PROJECTS_VIEW", name: "Consulter les projets", module: "PROJECTS", description: "Peut voir les projets et leur avancement" },
  { code: "PROJECTS_CREATE", name: "Créer des projets", module: "PROJECTS", description: "Peut initialiser de nouveaux projets" },
  { code: "PROJECTS_UPDATE", name: "Mettre à jour les projets", module: "PROJECTS", description: "Peut modifier les statuts et tâches" },
  { code: "PROJECTS_DELETE", name: "Supprimer des projets", module: "PROJECTS", description: "Peut clore ou supprimer des projets" },
];

/**
 * Matrice des permissions par défaut associées aux rôles système
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: DEFAULT_PERMISSIONS.map((p) => p.code),
  MANAGER: [
    "SETTINGS_VIEW",
    "MEMBERS_VIEW",
    "MEMBERS_INVITE",
    "DOCUMENTS_VIEW",
    "DOCUMENTS_CREATE",
    "DOCUMENTS_UPDATE",
    "DOCUMENTS_SHARE",
    "HR_POSITIONS_MANAGE",
    "CLIENTS_VIEW",
    "CLIENTS_CREATE",
    "CLIENTS_UPDATE",
    "PROJECTS_VIEW",
    "PROJECTS_CREATE",
    "PROJECTS_UPDATE",
  ],
  COMPTABLE: [
    "SETTINGS_VIEW",
    "MEMBERS_VIEW",
    "DOCUMENTS_VIEW",
    "DOCUMENTS_CREATE",
    "HR_SALARY_VIEW",
    "BILLING_VIEW",
    "INVOICES_VIEW",
    "INVOICES_CREATE",
    "CLIENTS_VIEW",
  ],
  COLLABORATOR: [
    "MEMBERS_VIEW",
    "DOCUMENTS_VIEW",
    "DOCUMENTS_CREATE",
    "CLIENTS_VIEW",
    "PROJECTS_VIEW",
    "PROJECTS_UPDATE",
  ],
  EMPLOYEE: [
    "MEMBERS_VIEW",
    "DOCUMENTS_VIEW",
    "DOCUMENTS_CREATE",
    "PROJECTS_VIEW",
  ],
  VIEWER: [
    "SETTINGS_VIEW",
    "MEMBERS_VIEW",
    "DOCUMENTS_VIEW",
    "CLIENTS_VIEW",
    "PROJECTS_VIEW",
  ],
};

/**
 * Vérifie si un utilisateur dispose de la permission demandée dans une entreprise
 * @param userId Identifiant de l'utilisateur
 * @param companyId Identifiant ou slug de l'entreprise
 * @param module Nom du module (ex: "SETTINGS", "MEMBERS", "DOCUMENTS", "HR", etc.)
 * @param action Action ou code de permission (ex: "UPDATE" ou "SETTINGS_UPDATE")
 */
export async function can(
  userId: string,
  companyId: string,
  module: SystemModule | string,
  action: string
): Promise<boolean> {
  if (!userId || !companyId) return false;

  try {
    const membership = await db.membership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ companyId }, { company: { slug: companyId } }],
      },
      include: {
        company: true,
      },
    });

    if (!membership || membership.company.status !== "ACTIVE") {
      return false;
    }

    const { roleId, customPermissions, allowedModules } = membership;

    // 1. Le SUPER_ADMIN dispose de tous les droits inconditionnellement
    if (roleId === "SUPER_ADMIN") {
      return true;
    }

    // 2. Si le module fait l'objet d'une restriction d'accès explicite sur le membre
    if (allowedModules && allowedModules.length > 0) {
      if (!allowedModules.includes(module) && !allowedModules.includes("*")) {
        return false;
      }
    }

    // Construction du code de permission normalisé (ex: "SETTINGS_UPDATE")
    const permissionCode = action.includes("_") ? action : `${module}_${action}`;

    // 3. Vérification des permissions personnalisées explicites du membre
    if (customPermissions && customPermissions.length > 0) {
      if (customPermissions.includes(permissionCode) || customPermissions.includes("*")) {
        return true;
      }
    }

    // 4. Vérification des permissions associées au rôle en base ou par matrice par défaut
    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    const rolePerms = role?.permissions?.length
      ? role.permissions
      : DEFAULT_ROLE_PERMISSIONS[roleId] || [];

    if (rolePerms.includes("*") || rolePerms.includes(permissionCode)) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Erreur lors de la vérification d'autorisation (can):", err);
    return false;
  }
}

/**
 * Garde d'autorisation : lève une exception si l'action n'est pas permise
 */
export async function requirePermission(
  userId: string,
  companyId: string,
  module: SystemModule | string,
  action: string
): Promise<void> {
  const allowed = await can(userId, companyId, module, action);
  if (!allowed) {
    throw new Error(`Accès refusé : permission insuffisante (${module}:${action})`);
  }
}
