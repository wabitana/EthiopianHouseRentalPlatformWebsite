import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyChapaPayment } from "@/lib/chapa";
import { addOrderTracking, addBookingTracking } from "@/lib/tracking";

export async function GET(req: NextRequest) {
  const txRef = req.nextUrl.searchParams.get("trx_ref") || req.nextUrl.searchParams.get("tx_ref");

  if (!txRef) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  const verification = await verifyChapaPayment(txRef);
  const success = verification?.data?.status === "success" || verification?.status === "success";

  const payment = await prisma.payment.findUnique({
    where: { chapaTxRef: txRef },
    include: { order: true, serviceBooking: true },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    });

    if (payment.orderId) {
      await addOrderTracking(
        payment.orderId,
        "CONFIRMED",
        "Payment confirmed — order is being prepared"
      );
      if (payment.order?.vendorId) {
        await prisma.vendor.update({
          where: { id: payment.order.vendorId },
          data: { revenue: { increment: payment.amount - (payment.order.commission || 0) } },
        });
      }
    }

    if (payment.serviceBookingId) {
      await prisma.serviceBooking.update({
        where: { id: payment.serviceBookingId },
        data: { finalPrice: payment.amount },
      });
      await addBookingTracking(
        payment.serviceBookingId,
        "SCHEDULED",
        "Payment confirmed — your service is scheduled"
      );
    }
  } else {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ success, txRef });
}
