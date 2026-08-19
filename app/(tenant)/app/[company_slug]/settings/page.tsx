import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

interface SettingsPageProps {
  params: Promise<{ company_slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params;
  const companySlug = resolvedParams.company_slug;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Charger l'entreprise avec ses membres, invitations, branding, départements, postes et domaines
  const company = await db.company.findUnique({
    where: { slug: companySlug },
    include: {
      memberships: {
        include: {
          user: true,
        },
      },
      invitations: true,
      branding: true,
      departments: true,
      positions: true,
      customDomains: true,
    },
  });

  if (!company) {
    redirect("/select-workspace");
  }

  // Vérification de l'autorisation d'accès aux réglages
  const userMembership = company.memberships.find((m) => m.userId === session.userId && m.status === "ACTIVE");
  if (!userMembership || (userMembership.roleId !== "SUPER_ADMIN" && userMembership.roleId !== "ADMIN")) {
    redirect(`/app/${companySlug}/dashboard`);
  }

  // Récupérer les autres workspaces pour le sélecteur
  const userMemberships = await db.membership.findMany({
    where: { userId: session.userId, status: "ACTIVE" },
    include: { company: true },
  });
  const otherWorkspaces = userMemberships.filter((m) => m.company.slug !== companySlug);

  // Charger les rôles du système
  let roles = await db.role.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (roles.length === 0) {
    const now = new Date();
    roles = [
      { id: "SUPER_ADMIN", name: "Super Admin", description: "Propriétaire avec droits absolus", isSystem: true, permissions: ["*"], createdAt: now, updatedAt: now },
      { id: "ADMIN", name: "Administrateur", description: "Gestion complète du workspace", isSystem: true, permissions: [], createdAt: now, updatedAt: now },
      { id: "MANAGER", name: "Manager", description: "Gestion opérationnelle et clients", isSystem: true, permissions: [], createdAt: now, updatedAt: now },
      { id: "COMPTABLE", name: "Comptable", description: "Factures et rapports financiers", isSystem: true, permissions: [], createdAt: now, updatedAt: now },
      { id: "COLLABORATOR", name: "Collaborateur", description: "Tâches et lecture simple", isSystem: true, permissions: [], createdAt: now, updatedAt: now },
    ];
  }

  // Liste propre des membres
  const members = company.memberships.map((m) => ({
    userId: m.userId,
    firstName: m.user.firstName,
    lastName: m.user.lastName,
    email: m.user.email,
    phone: m.user.phone,
    roleId: m.roleId,
    status: m.status,
    joinedAt: m.joinedAt,
    position: m.position,
    department: m.department,
    collaborationStatus: m.collaborationStatus,
    allowedModules: m.allowedModules,
  }));

  // Liste propre des invitations en attente
  const invitations = company.invitations
    .filter((i) => i.status === "PENDING")
    .map((i) => ({
      id: i.id,
      email: i.email,
      roleId: i.roleId,
      status: i.status,
      expiresAt: i.expiresAt,
      createdAt: i.createdAt,
      position: i.position,
      department: i.department,
      collaborationStatus: i.collaborationStatus,
      token: i.token,
    }));

  return (
    <SettingsForm 
      company={company}
      session={session}
      members={members}
      invitations={invitations}
      roles={roles}
      otherWorkspaces={otherWorkspaces.map((m) => m.company)}
      departments={company.departments || []}
      positions={company.positions || []}
      customDomains={company.customDomains || []}
      branding={company.branding || null}
    />
  );
}
