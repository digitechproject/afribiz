import { PrismaClient } from "@prisma/client";
import { DEFAULT_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "../lib/authz";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed du catalogue de Rôles et Permissions V6...");

  // 1. Initialisation des permissions
  for (const perm of DEFAULT_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        module: perm.module,
        description: perm.description,
      },
      create: {
        id: perm.code,
        code: perm.code,
        name: perm.name,
        module: perm.module,
        description: perm.description,
      },
    });
  }
  console.log(`✅ ${DEFAULT_PERMISSIONS.length} permissions synchronisées.`);

  // 2. Initialisation des rôles système
  const rolesDefinitions: { id: string; name: string; description: string }[] = [
    { id: "SUPER_ADMIN", name: "Super Administrateur", description: "Propriétaire et contrôle total du workspace" },
    { id: "ADMIN", name: "Administrateur", description: "Gestion globale de l'entreprise et des collaborateurs" },
    { id: "MANAGER", name: "Manager / Responsable", description: "Gestion opérationnelle d'équipe, clients et projets" },
    { id: "COMPTABLE", name: "Comptable / Financier", description: "Accès à la facturation, devis et volet financier RH" },
    { id: "COLLABORATOR", name: "Collaborateur", description: "Accès standard aux outils de travail et documents" },
    { id: "EMPLOYEE", name: "Employé", description: "Accès aux espaces de travail et documents personnels" },
    { id: "VIEWER", name: "Lecteur / Auditeur", description: "Consultation en lecture seule" },
  ];

  for (const role of rolesDefinitions) {
    const permissions = DEFAULT_ROLE_PERMISSIONS[role.id] || [];
    await prisma.role.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description,
        isSystem: true,
        permissions,
      },
      create: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: true,
        permissions,
      },
    });
  }
  console.log(`✅ ${rolesDefinitions.length} rôles système synchronisés.`);
  console.log("🌱 Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
