const isProd = process.env.NODE_ENV === "production";
const DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || (isProd ? "afribizsuite.com" : "localhost:3000");
const PROTOCOL = isProd ? "https" : "http";

/**
 * Génère l'URL absolue pour une entreprise sous son sous-domaine
 */
export function getCompanyUrl(slug: string, path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${PROTOCOL}://${slug}.${DOMAIN}${cleanPath}`;
}

/**
 * Génère l'URL absolue pour la plateforme principale
 */
export function getMainUrl(path = ""): string {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${PROTOCOL}://${DOMAIN}${cleanPath}`;
}
