import { db } from "@/lib/db";

export interface TenantBrandingData {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  loginBannerUrl?: string | null;
  loginHeadline?: string | null;
  loginTagline?: string | null;
  customCss?: string | null;
}

/**
 * Calcule la couleur de texte optimale (#ffffff ou #0f172a) pour un arrière-plan donné (contraste WCAG)
 */
export function getContrastColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith("#")) return "#ffffff";

  let cleanHex = hexColor.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Formule de luminance relative YIQ
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0f172a" : "#ffffff";
}

/**
 * Génère les variables CSS complètes pour le thème d'un tenant
 */
export function generateCssVariables(branding: Partial<TenantBrandingData>): string {
  const primary = branding.primaryColor || "#0f766e";
  const secondary = branding.secondaryColor || "#0284c7";
  const accent = branding.accentColor || "#f59e0b";
  const primaryContrast = getContrastColor(primary);

  return `
    :root {
      --primary: ${primary} !important;
      --color-primary: ${primary} !important;
      --primary-foreground: ${primaryContrast} !important;
      --secondary: ${secondary} !important;
      --color-secondary: ${secondary} !important;
      --accent: ${accent} !important;
      --color-accent: ${accent} !important;
      ${branding.fontFamily ? `--font-sans: '${branding.fontFamily}', sans-serif !important;` : ""}
    }
  `;
}

/**
 * Récupère le branding configuré pour une entreprise
 */
export async function getTenantBranding(companySlugOrId: string): Promise<TenantBrandingData> {
  try {
    const company = await db.company.findFirst({
      where: {
        OR: [{ slug: companySlugOrId }, { id: companySlugOrId }],
      },
      include: {
        branding: true,
      },
    });

    if (!company) {
      return {
        primaryColor: "#0f766e",
        secondaryColor: "#0284c7",
        accentColor: "#f59e0b",
        fontFamily: "Inter",
        logoUrl: null,
      };
    }

    return {
      primaryColor: company.branding?.primaryColor || company.primaryColor || "#0f766e",
      secondaryColor: company.branding?.secondaryColor || "#0284c7",
      accentColor: company.branding?.accentColor || "#f59e0b",
      fontFamily: company.branding?.fontFamily || "Inter",
      logoUrl: company.branding?.logoUrl || company.logo || null,
      faviconUrl: company.branding?.faviconUrl || null,
      loginBannerUrl: company.branding?.loginBannerUrl || null,
      loginHeadline: company.branding?.loginHeadline || null,
      loginTagline: company.branding?.loginTagline || null,
      customCss: company.branding?.customCss || null,
    };
  } catch (err) {
    console.error("Erreur lors de la récupération du branding:", err);
    return {
      primaryColor: "#0f766e",
      secondaryColor: "#0284c7",
      accentColor: "#f59e0b",
      fontFamily: "Inter",
    };
  }
}
