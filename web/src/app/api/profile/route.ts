import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      city: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, serviceBookings: true } },
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = updateSchema.parse(await req.json());
    const user = await prisma.user.update({
      where: { id: session.id },
      data,
      select: { id: true, email: true, name: true, phone: true, address: true, city: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
