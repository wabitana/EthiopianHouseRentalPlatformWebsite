import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAppointmentSlots } from "@/lib/services";
import type { ServiceType } from "@/types";

export async function GET(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get("type") || "CLEANING") as ServiceType;
  const date = req.nextUrl.searchParams.get("date");

  const slots = generateAppointmentSlots(type);

  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const booked = await prisma.serviceBooking.findMany({
      where: {
        type,
        scheduledAt: { gte: dayStart, lte: dayEnd },
        status: { notIn: ["CANCELLED"] },
      },
      select: { scheduledAt: true },
    });

    const bookedHours = booked.map((b) => {
      const h = b.scheduledAt.getHours().toString().padStart(2, "0");
      const m = b.scheduledAt.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    });

    const daySlots = slots.find((s) => s.date === date);
    const available = (daySlots?.slots || []).filter((s) => !bookedHours.includes(s));

    return NextResponse.json({ date, slots: available, booked: bookedHours });
  }

  return NextResponse.json({ schedule: slots });
}
