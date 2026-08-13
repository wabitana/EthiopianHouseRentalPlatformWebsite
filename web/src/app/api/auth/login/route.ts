import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, setAuthCookie, toRole } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (data.role) {
      const reqRole = data.role.toUpperCase();
      const userRole = user.role.toUpperCase();
      if (userRole !== reqRole && userRole !== "ADMIN") {
        const registeredLabel = userRole === "CUSTOMER" || userRole === "SEEKER" ? "House Seeker" : "House Provider";
        const selectedLabel = reqRole === "CUSTOMER" || reqRole === "SEEKER" ? "House Seeker" : "House Provider";
        return NextResponse.json(
          { error: `This account is registered as a ${registeredLabel}. You cannot log in as ${selectedLabel}. Please select '${registeredLabel}' to log in.` },
          { status: 403 }
        );
      }
    }

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
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
