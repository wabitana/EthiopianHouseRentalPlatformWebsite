import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: session.id, read: false },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, markAllRead } = await req.json();

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: session.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  }

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: session.id },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
