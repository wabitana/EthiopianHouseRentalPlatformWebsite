import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { Role } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "delala-fallback-secret"
);

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

export function toRole(roles?: string[] | string | null): Role {
  if (Array.isArray(roles)) {
    return (roles[0] || "RENTER") as Role;
  }
  return (roles || "RENTER") as Role;
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("delala_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireSession(roles?: Role[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (roles && !roles.includes(session.role)) throw new Error("Forbidden");
  return session;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("delala_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("delala_token");
}

export async function getUserWithVendor(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { vendor: true },
  });
}
