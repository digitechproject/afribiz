import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getTenantBranding } from "@/lib/branding";
import CompanyLoginForm from "./CompanyLoginForm";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  params: Promise<{ company_slug: string }>;
}

export default async function CompanyLoginPage({ params }: LoginPageProps) {
  const resolvedParams = await params;
  const companySlug = resolvedParams.company_slug;

  const company = await db.company.findUnique({
    where: { slug: companySlug },
  });

  if (!company || company.status !== "ACTIVE") {
    notFound();
  }

  const branding = await getTenantBranding(company.slug);

  return (
    <CompanyLoginForm 
      company={{
        name: company.name,
        legalName: company.legalName,
        logo: branding.logoUrl || null,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        slug: company.slug,
        loginHeadline: branding.loginHeadline,
        loginTagline: branding.loginTagline,
      }}
    />
  );
}
