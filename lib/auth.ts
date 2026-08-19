import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "afribiz_super_secret_key_2026_xyz_123"
);

export interface SessionPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  activeCompanyId?: string;
  activeCompanySlug?: string;
  activeRole?: string;
}

export function getCookieDomain(): string | undefined {
  if (process.env.COOKIE_DOMAIN) {
    return process.env.COOKIE_DOMAIN;
  }
  const rootDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
  if (rootDomain && rootDomain !== "localhost") {
    return `.${rootDomain.replace(/^\./, "")}`;
  }
  return undefined;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(
  payload: SessionPayload,
  options?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const token = await encrypt(payload);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  // Persistance de la session en base de données pour permettre la révocation
  try {
    await db.session.create({
      data: {
        userId: payload.userId,
        token,
        expiresAt,
        ipAddress: options?.ipAddress || null,
        userAgent: options?.userAgent || null,
      },
    });
  } catch (err) {
    console.error("Erreur lors de la persistance de la session en base:", err);
  }

  const cookieStore = await cookies();
  const cookieDomain = getCookieDomain();

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    domain: cookieDomain,
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const payload = await decrypt(token);
  if (!payload) return null;

  // Validation de l'existence et validité de la session en base
  try {
    const dbSession = await db.session.findUnique({
      where: { token },
    });

    if (!dbSession || new Date() > dbSession.expiresAt) {
      // Session expirée ou révoquée
      cookieStore.delete("session");
      return null;
    }
  } catch (err) {
    console.error("Erreur lors de la vérification de la session en base:", err);
    // En cas de panne temporaire DB, le JWT décrypté sert de fallback contrôlé
  }

  return payload;
}

export async function updateSessionCompany(companyId: string, companySlug: string, role: string) {
  const current = await getSession();
  if (!current) return;

  const updated: SessionPayload = {
    ...current,
    activeCompanyId: companyId,
    activeCompanySlug: companySlug,
    activeRole: role,
  };

  await createSession(updated);
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    try {
      await db.session.deleteMany({
        where: { token },
      });
    } catch (err) {
      console.error("Erreur lors de la suppression de la session:", err);
    }
  }

  const cookieDomain = getCookieDomain();
  cookieStore.delete({
    name: "session",
    path: "/",
    domain: cookieDomain,
  });
}

export async function revokeUserSessions(userId: string) {
  try {
    await db.session.deleteMany({
      where: { userId },
    });
  } catch (err) {
    console.error("Erreur lors de la révocation des sessions:", err);
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  return await decrypt(token);
}
