import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let added = 0;
  for (const item of order.items) {
    if (!item.product.active || item.product.stock < 1) continue;

    await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: session.id, productId: item.productId },
      },
      update: { quantity: { increment: item.quantity } },
      create: {
        userId: session.id,
        productId: item.productId,
        quantity: item.quantity,
      },
    });
    added++;
  }

  if (added === 0) {
    return NextResponse.json(
      { error: "No items available to reorder" },
      { status: 400 }
    );
  }

  await createNotification({
    userId: session.id,
    title: "Reorder ready",
    message: `${added} item(s) from order ${order.orderNumber} added to your cart.`,
    type: "ORDER",
    link: "/cart",
  });

  return NextResponse.json({ success: true, added, redirect: "/cart" });
}
