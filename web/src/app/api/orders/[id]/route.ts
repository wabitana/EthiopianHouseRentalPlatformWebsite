import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getOrderTimeline } from "@/lib/tracking";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payment: true,
      vendor: { select: { businessName: true } },
      tracking: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.userId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    order,
    timeline: getOrderTimeline(order.status),
  });
}
