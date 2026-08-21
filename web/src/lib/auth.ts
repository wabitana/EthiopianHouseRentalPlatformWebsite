import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { Role } from "@/types";

const getSecretKey = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "ethiopian_house_rental_super_secret_jwt_key_2026"
  );

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function toRole(role: string): Role {
  return role as Role;
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ sub: user.id, id: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      id: (payload.id || payload.sub) as string,
      email: payload.email as string,
      name: (payload.name || payload.email || "Admin User") as string,
      role: (payload.role || "admin") as Role,
    };
  } catch (error) {
    // Only log non-expiry errors — expiry is expected and handled by refresh
    const code = (error as any)?.code;
    if (code !== "ERR_JWT_EXPIRED") {
      console.warn("JWT Verification failed in web/src/lib/auth.ts:", error);
    }
    return null;
  }
}

/**
 * Attempts to refresh the access token using the HttpOnly refresh cookie.
 * On success, updates both cookies in the response and returns the new session.
 * This runs server-side inside Server Components / layouts.
 */
async function tryServerSideRefresh(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("delala_refresh_token")?.value;
    if (!refreshToken) return null;

    const response = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      // Refresh failed — attempt to clear cookies if allowed, ignore if in Server Component
      try {
        cookieStore.delete("delala_token");
        cookieStore.delete("delala_refresh_token");
      } catch {}
      return null;
    }

    const data = await response.json();
    const newToken: string = data.token;
    const newRefreshToken: string = data.refreshToken;

    if (!newToken) return null;

    // Safely attempt to set updated cookies if running in Route Handler / Action
    const isProduction = process.env.NODE_ENV === "production";
    try {
      cookieStore.set("delala_token", newToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      if (newRefreshToken) {
        cookieStore.set("delala_refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: "/",
        });
      }
    } catch {}

    return verifyToken(newToken);
  } catch (error) {
    return null;
  }
}

/**
 * Returns the current session user.
 * If the access token is expired but a refresh token cookie exists,
 * silently refreshes and returns the session — no logout needed.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("delala_token")?.value;

  if (token) {
    const session = await verifyToken(token);
    if (session) return session;

    // Access token expired — attempt server-side refresh
    return tryServerSideRefresh();
  }

  // No access token at all — try refresh if refresh token exists
  const hasRefreshToken = !!cookieStore.get("delala_refresh_token")?.value;
  if (hasRefreshToken) {
    return tryServerSideRefresh();
  }

  return null;
}

export async function requireSession(roles?: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (roles && !roles.includes(session.role)) throw new Error("Forbidden");
  return session;
}

export async function setAuthCookie(token: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("delala_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });
  } catch {}
}

export async function clearAuthCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("delala_token");
    cookieStore.delete("delala_refresh_token");
  } catch {}
}
