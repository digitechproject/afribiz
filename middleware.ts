import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "./lib/auth";
import { resolveTenantFromHost, isReservedSubdomain } from "./lib/tenant";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  // Injecter le pathname dans les headers pour pouvoir le lire dans les Server Component Layouts
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const hostHeader = request.headers.get("host");
  const isProd = process.env.NODE_ENV === "production";
  const rootDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || (isProd ? "afribizsuite.com" : "localhost");

  const resolution = resolveTenantFromHost(hostHeader, rootDomain);
  const tenant = resolution.tenantSlug;

  // 1. Si un sous-domaine réservé tente d'accéder au routage tenant
  if (tenant && isReservedSubdomain(tenant)) {
    const protocol = isProd ? "https" : "http";
    return NextResponse.redirect(new URL(`${protocol}://${rootDomain}/`));
  }

  // 2. Gestion des routes sur un sous-domaine d'entreprise (tenant)
  if (tenant) {
    // Routes globales autorisées en réécriture sur sous-domaine
    if (pathname === "/invitation/accept") {
      return NextResponse.rewrite(
        new URL(`/invitation/accept?${request.nextUrl.searchParams.toString()}`, request.url),
        { request: { headers: requestHeaders } }
      );
    }

    if (pathname === "/forgot-password") {
      return NextResponse.rewrite(
        new URL(`/forgot-password?${request.nextUrl.searchParams.toString()}`, request.url),
        { request: { headers: requestHeaders } }
      );
    }
    if (pathname === "/reset-password") {
      return NextResponse.rewrite(
        new URL(`/reset-password?${request.nextUrl.searchParams.toString()}`, request.url),
        { request: { headers: requestHeaders } }
      );
    }

    // Gestion de la page de connexion contextualisée à l'entreprise
    if (pathname === "/login") {
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.rewrite(new URL(`/app/${tenant}/login`, request.url), {
        request: { headers: requestHeaders },
      });
    }

    // Routes internes au workspace entreprise
    if (pathname === "/dashboard" || pathname === "/settings" || pathname === "/onboarding") {
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.rewrite(new URL(`/app/${tenant}${pathname}`, request.url), {
        request: { headers: requestHeaders },
      });
    }

    // Racine du sous-domaine
    if (pathname === "/") {
      if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Bloquer les routes réservées au portail central sur un sous-domaine d'entreprise
    if (pathname === "/select-workspace" || pathname === "/register" || pathname === "/auth") {
      const protocol = isProd ? "https" : "http";
      const rootUrl = `${protocol}://${rootDomain}${
        pathname === "/select-workspace" ? "/select-workspace" : "/login"
      }`;
      return NextResponse.redirect(new URL(rootUrl));
    }
  } else {
    // 3. Gestion des routes sur le portail principal (domaine racine)
    const isAuthRoute =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/verify-account" ||
      pathname === "/auth";

    const isProtectedRoute =
      pathname === "/select-workspace" ||
      pathname === "/onboarding" ||
      pathname === "/dashboard" ||
      pathname === "/profile" ||
      pathname === "/documents" ||
      pathname === "/invitations";

    // Redirection des utilisateurs non connectés
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirection des utilisateurs connectés tentant d'accéder aux pages auth
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/verify-account",
    "/auth",
    "/select-workspace",
    "/onboarding",
    "/dashboard",
    "/settings",
    "/profile",
    "/documents",
    "/invitations",
    "/invitation/accept",
    "/forgot-password",
    "/reset-password",
  ],
};
