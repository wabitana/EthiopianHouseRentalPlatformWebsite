import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");

  const reviews = await prisma.review.findMany({
    where: {
      serviceBookingId: { not: null },
      ...(type
        ? { serviceBooking: { type } }
        : {}),
    },
    include: {
      user: { select: { name: true } },
      serviceBooking: { select: { type: true, bookingNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return NextResponse.json({ reviews, averageRating: Math.round(avg * 10) / 10 });
}

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = reviewSchema.parse(await req.json());

    const booking = await prisma.serviceBooking.findFirst({
      where: { id: data.bookingId, userId: session.id, status: "COMPLETED" },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or not eligible for review" },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findUnique({
      where: { serviceBookingId: data.bookingId },
    });
    if (existing) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.id,
        serviceBookingId: data.bookingId,
        vendorId: booking.vendorId,
        rating: data.rating,
        comment: data.comment,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Review failed" }, { status: 500 });
  }
}
