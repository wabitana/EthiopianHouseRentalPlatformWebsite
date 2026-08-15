import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscriptions = await prisma.serviceSubscription.findMany({
    where: { userId: session.id },
    include: { package: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscriptions });
}

const subscribeSchema = z.object({
  packageId: z.string(),
  address: z.string().min(5),
  city: z.string().default("Addis Ababa"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = subscribeSchema.parse(await req.json());
    const pkg = await prisma.servicePackage.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg || !pkg.isSubscription) {
      return NextResponse.json({ error: "Invalid subscription package" }, { status: 400 });
    }

    const price = pkg.basePrice * (1 - pkg.discountPercent / 100);
    const nextService = new Date();
    nextService.setDate(nextService.getDate() + 30);

    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + 12);

    const subscription = await prisma.serviceSubscription.create({
      data: {
        userId: session.id,
        packageId: pkg.id,
        type: pkg.type,
        price,
        address: data.address,
        city: data.city,
        nextServiceAt: nextService,
        endsAt,
      },
      include: { package: true },
    });

    await createNotification({
      userId: session.id,
      title: "Service subscription active",
      message: `Your ${pkg.name} subscription is now active. Next service: ${nextService.toLocaleDateString()}`,
      type: "SERVICE",
      link: "/services/subscriptions",
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();

  const subscription = await prisma.serviceSubscription.updateMany({
    where: { id, userId: session.id },
    data: { status },
  });

  return NextResponse.json({ subscription });
}
