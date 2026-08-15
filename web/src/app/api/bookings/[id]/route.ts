import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getServiceTimeline } from "@/lib/tracking";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.serviceBooking.findUnique({
    where: { id },
    include: {
      payment: true,
      provider: { select: { name: true, phone: true } },
      review: true,
      package: true,
      tracking: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.userId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    booking,
    timeline: getServiceTimeline(booking.status),
  });
}
