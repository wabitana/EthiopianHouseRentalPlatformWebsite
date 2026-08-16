import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("delala_token")?.value;
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    // Base64Url decode payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    const isAdmin = payload.roles?.includes("ADMIN");
    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name || "Admin User",
      role: isAdmin ? "ADMIN" : (payload.roles?.[0] || "RENTER"),
      roles: payload.roles || [],
    };
  } catch (e) {
    return null;
  }
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set("delala_token", "", { maxAge: 0, path: "/" });
}
