import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { initializeChapaPayment } from "@/lib/chapa";
import { seedInitialTracking } from "@/lib/tracking";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where =
    session.role === "ADMIN"
      ? {}
      : session.role === "VENDOR"
        ? { vendor: { userId: session.id } }
        : { userId: session.id };

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      payment: true,
      user: { select: { name: true, email: true } },
      vendor: { select: { businessName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { shippingAddress, shippingCity, shippingLat, shippingLng, notes } = body;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: { product: { include: { vendor: true } } },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const vendorId = cartItems[0].product.vendorId;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const commissionRate = cartItems[0].product.vendor.commissionRate / 100;
  const commission = subtotal * commissionRate;
  const total = subtotal;
  const orderNumber = generateOrderNumber();
  const txRef = `pay-${orderNumber}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.id,
      vendorId,
      subtotal,
      commission,
      total,
      notes,
      shippingAddress,
      shippingCity,
      shippingLat,
      shippingLng,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          name: item.product.name,
        })),
      },
      payment: {
        create: {
          amount: total,
          chapaTxRef: txRef,
          status: "PENDING",
        },
      },
    },
    include: { payment: true, items: true },
  });

  await prisma.cartItem.deleteMany({ where: { userId: session.id } });

  await seedInitialTracking(order.id, "PENDING", "Order placed — awaiting payment");
  await createNotification({
    userId: session.id,
    title: `Order ${orderNumber}`,
    message: "Complete payment to confirm your order.",
    type: "ORDER",
    link: `/orders/${order.id}`,
  });

  const [firstName, ...rest] = session.name.split(" ");
  const chapa = await initializeChapaPayment({
    amount: total,
    email: session.email,
    firstName: firstName || session.name,
    lastName: rest.join(" ") || "Customer",
    txRef,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/chapa/callback`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=success`,
    title: "Delala Rental Order",
    description: `Order ${orderNumber}`,
  });

  if (chapa.data?.checkout_url) {
    await prisma.payment.update({
      where: { id: order.payment!.id },
      data: { chapaCheckoutUrl: chapa.data.checkout_url },
    });
  }

  return NextResponse.json({
    order,
    checkoutUrl: chapa.data?.checkout_url,
  });
}
