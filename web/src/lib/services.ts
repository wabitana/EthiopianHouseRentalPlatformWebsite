import type { ServiceType } from "@/types";
import { estimateServicePrice, type ServicePricingInput } from "./pricing";

export interface PriceBreakdownItem {
  label: string;
  amount: number;
}

export function getPriceBreakdown(input: ServicePricingInput): {
  items: PriceBreakdownItem[];
  subtotal: number;
  discount: number;
  total: number;
} {
  const items: PriceBreakdownItem[] = [];
  const basePrices: Record<ServiceType, number> = {
    CLEANING: 1500,
    PEST_CONTROL: 2500,
    MOVING: 3000,
  };

  let subtotal = basePrices[input.type];
  items.push({ label: "Base service fee", amount: subtotal });

  if (input.propertySize) {
    const multipliers: Record<string, number> = {
      small: 1,
      medium: 1.5,
      large: 2.2,
      commercial: 3,
    };
    const mult = multipliers[input.propertySize] || 1;
    if (mult > 1) {
      const extra = Math.round(subtotal * (mult - 1));
      items.push({ label: `Property size (${input.propertySize})`, amount: extra });
      subtotal += extra;
    }
  }

  if (input.rooms && input.type === "CLEANING") {
    const roomCost = input.rooms * 300;
    items.push({ label: `${input.rooms} rooms`, amount: roomCost });
    subtotal += roomCost;
  }

  if (input.distanceKm && input.type === "MOVING") {
    const distCost = input.distanceKm * 50;
    items.push({ label: `${input.distanceKm} km distance`, amount: distCost });
    subtotal += distCost;
  }

  let discount = 0;
  if (input.packageName === "premium") {
    const premium = Math.round(subtotal * 0.35);
    items.push({ label: "Premium package (+35%)", amount: premium });
    subtotal += premium;
  } else if (input.packageName === "subscription_monthly") {
    discount = Math.round(subtotal * 0.15);
    items.push({ label: "Monthly subscription (-15%)", amount: -discount });
    subtotal -= discount;
  }

  return {
    items,
    subtotal: subtotal + discount,
    discount,
    total: Math.round(subtotal),
  };
}

export function generateAppointmentSlots(
  type: ServiceType,
  daysAhead = 14
): Array<{ date: string; slots: string[] }> {
  const result: Array<{ date: string; slots: string[] }> = [];
  const slotHours =
    type === "MOVING"
      ? ["08:00", "09:00", "10:00"]
      : ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  for (let d = 1; d <= daysAhead; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    if (date.getDay() === 0) continue;
    result.push({
      date: date.toISOString().split("T")[0],
      slots: slotHours,
    });
  }
  return result;
}

export async function autoAssignProvider(
  type: ServiceType,
  vendorId?: string | null
) {
  const { prisma } = await import("./prisma");

  const specialtyMap: Record<ServiceType, string> = {
    CLEANING: "CLEANING",
    PEST_CONTROL: "PEST_CONTROL",
    MOVING: "MOVING",
  };

  const provider = await prisma.vendorProvider.findFirst({
    where: {
      active: true,
      specialty: { in: [specialtyMap[type], "GENERAL"] },
      ...(vendorId ? { vendorId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  return provider;
}
