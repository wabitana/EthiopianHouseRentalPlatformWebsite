import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { estimateServicePrice } from "@/lib/pricing";
import { autoAssignProvider } from "@/lib/services";
import { generateBookingNumber } from "@/lib/utils";
import { initializeChapaPayment } from "@/lib/chapa";
import { seedInitialBookingTracking } from "@/lib/tracking";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  type: z.enum(["CLEANING", "PEST_CONTROL", "MOVING"]),
  scheduledAt: z.string(),
  address: z.string().min(5),
  city: z.string().default("Addis Ababa"),
  propertySize: z.string().optional(),
  rooms: z.number().optional(),
  distanceKm: z.number().optional(),
  packageName: z.string().optional(),
  packageId: z.string().optional(),
  subscriptionId: z.string().optional(),
  notes: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);
    const estimatedPrice = estimateServicePrice(data);
    const bookingNumber = generateBookingNumber();
    const txRef = `srv-${bookingNumber}`;

    const serviceVendor = await prisma.vendor.findFirst({
      where: { offersServices: true, status: "APPROVED" },
      orderBy: { createdAt: "asc" },
    });

    const assigned = await autoAssignProvider(data.type, serviceVendor?.id);
    let providerUserId: string | undefined;
    if (assigned?.providerId) {
      const linkedUser = await prisma.user.findUnique({
        where: { id: assigned.providerId },
      });
      if (linkedUser) providerUserId = linkedUser.id;
    }

    const booking = await prisma.serviceBooking.create({
      data: {
        bookingNumber,
        userId: session.id,
        vendorId: serviceVendor?.id,
        type: data.type,
        scheduledAt: new Date(data.scheduledAt),
        address: data.address,
        city: data.city,
        propertySize: data.propertySize,
        rooms: data.rooms,
        distanceKm: data.distanceKm,
        packageName: data.packageName,
        packageId: data.packageId,
        subscriptionId: data.subscriptionId,
        notes: data.notes,
        lat: data.lat,
        lng: data.lng,
        estimatedPrice,
        vendorProviderId: assigned?.id,
        assignedProviderName: assigned?.name,
        providerId: providerUserId,
        payment: {
          create: {
            amount: estimatedPrice,
            chapaTxRef: txRef,
            status: "PENDING",
          },
        },
      },
      include: { payment: true },
    });

    await seedInitialBookingTracking(
      booking.id,
      "PENDING",
      "Booking created — awaiting payment"
    );
    await createNotification({
      userId: session.id,
      title: `Booking ${bookingNumber}`,
      message: "Complete payment to confirm your service appointment.",
      type: "SERVICE",
      link: `/bookings/${booking.id}`,
    });

    const [firstName, ...rest] = session.name.split(" ");
    const chapa = await initializeChapaPayment({
      amount: estimatedPrice,
      email: session.email,
      firstName: firstName || session.name,
      lastName: rest.join(" ") || "Customer",
      txRef,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/chapa/callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders?booking=success`,
      title: "Delala Service",
      description: `Booking ${bookingNumber}`,
    });

    if (chapa.data?.checkout_url && booking.payment) {
      await prisma.payment.update({
        where: { id: booking.payment.id },
        data: { chapaCheckoutUrl: chapa.data.checkout_url },
      });
    }

    return NextResponse.json({
      booking,
      checkoutUrl: chapa.data?.checkout_url,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where =
    session.role === "ADMIN"
      ? {}
      : session.role === "SERVICE_PROVIDER"
        ? { providerId: session.id }
        : { userId: session.id };

  const bookings = await prisma.serviceBooking.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      provider: { select: { name: true } },
      payment: true,
    },
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
