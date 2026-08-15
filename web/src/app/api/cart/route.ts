import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: { product: { include: { vendor: true } } },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity = 1 } = await req.json();

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: session.id, productId, quantity },
    include: { product: true },
  });

  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, quantity } = await req.json();
  if (!productId || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: session.id, productId } },
    data: { quantity },
    include: { product: true },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  await prisma.cartItem.deleteMany({
    where: { userId: session.id, productId },
  });

  return NextResponse.json({ success: true });
}
