"use server";

import { db } from "@/lib/db";
import { getSession, updateSessionCompany } from "@/lib/auth";
import { onboardingCompanySchema } from "@/lib/validators";
import { slugify } from "@/lib/slug";
import { getCompanyUrl } from "@/lib/url";
import { isReservedSubdomain } from "@/lib/tenant";

export interface OnboardingResponse {
  success: boolean;
  error?: string;
  slug?: string;
  redirectTo?: string;
}

export async function createCompany(prevState: any, formData: FormData): Promise<OnboardingResponse> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Non autorisé. Veuillez vous connecter." };
  }

  const rawFields = Object.fromEntries(formData.entries());
  const validation = onboardingCompanySchema.safeParse(rawFields);
  if (!validation.success) {
    const errorMap = validation.error.flatten().fieldErrors;
    const firstError = Object.values(errorMap)[0]?.[0];
    return { success: false, error: firstError || "Données invalides" };
  }

  const { name, legalName, country, city, phone, email, activityType, legalForm } = validation.data;

  try {
    // Génération d'un slug unique en évitant les sous-domaines réservés
    let slug = slugify(name);
    if (isReservedSubdomain(slug)) {
      slug = `${slug}-app`;
    }

    const existingCount = await db.company.count({ where: { slug } });
    if (existingCount > 0) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 jours d'essai

    // Niveau de formalisation initial
    const formalizationLevel = activityType === "FREELANCE" ? "PERSONAL_IFU_ONLY" : "NOT_FORMALIZED";

    // Création de l'entreprise
    const company = await db.company.create({
      data: {
        ownerUserId: session.userId,
        name,
        legalName,
        slug,
        subdomain: slug,
        sector: "NOT_SET",
        country,
        city,
        phone,
        email,
        trialEndsAt,
        onboardingCompleted: false,
        onboardingCurrentStep: "SECTOR",
        activityType,
        legalForm: legalForm || null,
        formalizationLevel,
        administrativeStatus: "PENDING_VERIFICATION",
      },
    });

    // Création du branding initial par défaut
    await db.tenantBranding.create({
      data: {
        companyId: company.id,
        primaryColor: "#0f766e",
        secondaryColor: "#0284c7",
        accentColor: "#f59e0b",
      },
    });

    // Création du Membership Super Admin actif
    await db.membership.create({
      data: {
        userId: session.userId,
        companyId: company.id,
        roleId: "SUPER_ADMIN",
        status: "ACTIVE",
      },
    });

    // Création du résumé tenant initial
    await db.tenantSummary.create({
      data: {
        tenantId: company.id,
        employeesCount: 1,
        clientsCount: 0,
        invoicesCount: 0,
        monthlyRevenue: 0.0,
      },
    });

    // Mise à jour du cookie de session avec le nouveau contexte entreprise
    await updateSessionCompany(company.id, company.slug, "SUPER_ADMIN");

    return {
      success: true,
      slug: company.slug,
      redirectTo: getCompanyUrl(company.slug, "/onboarding"),
    };
  } catch (error) {
    console.error("Create company error:", error);
    return { success: false, error: "Une erreur est survenue lors de la création de l'entreprise." };
  }
}

export async function saveOnboardingSector(companySlug: string, sector: string): Promise<OnboardingResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company || company.ownerUserId !== session.userId) {
      return { success: false, error: "Workspace introuvable ou droits insuffisants." };
    }

    await db.company.update({
      where: { id: company.id },
      data: {
        sector,
        onboardingCurrentStep: "GOALS",
      },
    });

    return { success: true, redirectTo: `/onboarding?step=goals` };
  } catch (error) {
    return { success: false, error: "Erreur lors de la sauvegarde du secteur." };
  }
}

export async function saveOnboardingGoals(companySlug: string, goals: string[]): Promise<OnboardingResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company || company.ownerUserId !== session.userId) {
      return { success: false, error: "Workspace introuvable." };
    }

    await db.company.update({
      where: { id: company.id },
      data: {
        onboardingCurrentStep: "BRANDING",
      },
    });

    return { success: true, redirectTo: `/onboarding?step=branding` };
  } catch (error) {
    return { success: false, error: "Erreur lors de la sauvegarde des objectifs." };
  }
}

export async function saveOnboardingBranding(
  companySlug: string,
  primaryColor: string,
  devise: string,
  formalizationLevel: string
): Promise<OnboardingResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company || company.ownerUserId !== session.userId) {
      return { success: false, error: "Workspace introuvable." };
    }

    await db.company.update({
      where: { id: company.id },
      data: {
        primaryColor,
        formalizationLevel,
        onboardingCurrentStep: "PLAN",
      },
    });

    // Mettre à jour également TenantBranding
    await db.tenantBranding.upsert({
      where: { companyId: company.id },
      update: { primaryColor },
      create: { companyId: company.id, primaryColor },
    });

    return { success: true, redirectTo: `/onboarding?step=plan` };
  } catch (error) {
    return { success: false, error: "Erreur lors de la sauvegarde du branding." };
  }
}

export async function saveOnboardingPlan(companySlug: string, subscriptionPlan: string): Promise<OnboardingResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company || company.ownerUserId !== session.userId) {
      return { success: false, error: "Workspace introuvable." };
    }

    await db.company.update({
      where: { id: company.id },
      data: {
        subscriptionPlan,
        onboardingCurrentStep: "SETUP",
      },
    });

    return { success: true, redirectTo: `/onboarding?step=setup` };
  } catch (error) {
    return { success: false, error: "Erreur lors de la sauvegarde du plan." };
  }
}

export async function completeOnboarding(companySlug: string): Promise<OnboardingResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé" };

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company || company.ownerUserId !== session.userId) {
      return { success: false, error: "Workspace introuvable." };
    }

    await db.company.update({
      where: { id: company.id },
      data: {
        onboardingCompleted: true,
        onboardingCurrentStep: "COMPLETE",
      },
    });

    return { success: true, redirectTo: `/dashboard` };
  } catch (error) {
    return { success: false, error: "Erreur lors de la finalisation de l'onboarding." };
  }
}

export async function saveCompanyVerification(
  companySlug: string,
  formData: FormData
): Promise<OnboardingResponse> {
  const session = await getSession();
  if (!session) return { success: false, error: "Non autorisé." };

  const rccm = formData.get("rccm") as string;
  const companyIfu = formData.get("companyIfu") as string;
  const representativeName = formData.get("representativeName") as string;
  const representativeIfu = formData.get("representativeIfu") as string;

  try {
    const company = await db.company.findUnique({
      where: { slug: companySlug },
    });

    if (!company || company.ownerUserId !== session.userId) {
      return { success: false, error: "Workspace introuvable." };
    }

    const updates: any = {};
    if (rccm) updates.rccm = rccm;
    if (companyIfu) updates.companyIfu = companyIfu;
    if (representativeName) updates.representativeName = representativeName;
    if (representativeIfu) updates.representativeIfu = representativeIfu;

    let newLevel = company.formalizationLevel;
    let newStatus = company.administrativeStatus;

    if (company.activityType === "INDIVIDUAL_ESTABLISHMENT") {
      if ((rccm || company.rccm) && (companyIfu || company.companyIfu)) {
        newLevel = "ESTABLISHMENT_RCCM";
        newStatus = "ACTIVE";
      }
    } else if (company.activityType === "SOCIETY") {
      if ((rccm || company.rccm) && (companyIfu || company.companyIfu)) {
        newLevel = "SOCIETY_RCCM_IFU";
        newStatus = "ACTIVE";
      }
    }

    updates.formalizationLevel = newLevel;
    updates.administrativeStatus = newStatus;

    await db.company.update({
      where: { id: company.id },
      data: updates,
    });

    return { success: true };
  } catch (error) {
    console.error("Save company verification error:", error);
    return { success: false, error: "Une erreur est survenue lors de l'enregistrement." };
  }
}
