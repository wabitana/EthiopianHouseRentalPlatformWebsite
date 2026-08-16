import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie, toRole } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
  businessName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const targetRole = data.role === "VENDOR" ? "OWNER" : "RENTER";
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone || "",
        passwordHash,
        name: data.name,
        roles: [targetRole as any],
        ...(data.role === "VENDOR" && data.businessName
          ? {
              vendor: {
                create: {
                  businessName: data.businessName,
                  status: "PENDING",
                },
              },
            }
          : {}),
      },
    });

    const userRole = toRole(user.roles);
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: userRole,
    });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: userRole, roles: user.roles },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
