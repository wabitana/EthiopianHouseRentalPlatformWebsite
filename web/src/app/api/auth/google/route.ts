import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken, setAuthCookie, toRole } from "@/lib/auth";

const schema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const userEmail = data.email || "google_user@delala.com";
    const userName = data.name || "Google User";
    const requestedRole = data.role ? data.role.toUpperCase() : "CUSTOMER";

    const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

    if (existingUser && data.role) {
      const userRole = existingUser.role.toUpperCase();
      if (userRole !== requestedRole && userRole !== "ADMIN") {
        const registeredLabel = userRole === "CUSTOMER" || userRole === "SEEKER" ? "House Seeker" : "House Provider";
        const selectedLabel = requestedRole === "CUSTOMER" || requestedRole === "SEEKER" ? "House Seeker" : "House Provider";
        return NextResponse.json(
          { error: `This Google account is registered as a ${registeredLabel}. You cannot log in as ${selectedLabel}.` },
          { status: 403 }
        );
      }
    }

    const user = existingUser ?? (await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        phone: "+251 90 000 0000",
        passwordHash: "google_oauth_secure_hash",
        role: requestedRole === "VENDOR" ? "VENDOR" : "CUSTOMER",
        avatar: data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      },
    }));

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: toRole(user.role),
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Google login failed" }, { status: 500 });
  }
}
