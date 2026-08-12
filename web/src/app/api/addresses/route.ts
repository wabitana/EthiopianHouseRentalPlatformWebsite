import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const addressSchema = z.object({
  label: z.string().min(1),
  address: z.string().min(5),
  city: z.string().default("Addis Ababa"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.savedAddress.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = addressSchema.parse(await req.json());

    if (data.isDefault) {
      await prisma.savedAddress.updateMany({
        where: { userId: session.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.savedAddress.create({
      data: { ...data, userId: session.id },
    });

    return NextResponse.json({ address });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.savedAddress.deleteMany({ where: { id, userId: session.id } });
  return NextResponse.json({ success: true });
}
