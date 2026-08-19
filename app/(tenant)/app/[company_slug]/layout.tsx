import { redirect } from "next/navigation";
import { getSession, updateSessionCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ company_slug: string }>;
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  const companySlug = resolvedParams.company_slug;
  const session = await getSession();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Si on est sur la page de login du tenant, on rend le composant sans exiger de session
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!session) {
    redirect("/login");
  }

  // Vérification de l'existence de l'entreprise et du statut ACTIVE du membre
  const company = await db.company.findUnique({
    where: { slug: companySlug },
    include: {
      branding: true,
      memberships: {
        where: {
          userId: session.userId,
          status: "ACTIVE",
        },
      },
    },
  });

  if (!company || company.status !== "ACTIVE" || company.memberships.length === 0) {
    // Accès refusé : entreprise inexistante, inactive ou adhésion non ACTIVE
    redirect("/select-workspace");
  }

  const userMembership = company.memberships[0];

  // Si l'entreprise active en session diffère du tenant courant, synchroniser le cookie
  if (session.activeCompanySlug !== companySlug || session.activeRole !== userMembership.roleId) {
    await updateSessionCompany(company.id, company.slug, userMembership.roleId);
  }

  const primaryColor = company.branding?.primaryColor || company.primaryColor || "#0f766e";
  const secondaryColor = company.branding?.secondaryColor || "#0284c7";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor} !important;
              --color-primary: ${primaryColor} !important;
              --secondary: ${secondaryColor} !important;
              --color-secondary: ${secondaryColor} !important;
            }
          `,
        }}
      />
      {children}
    </>
  );
}
