import { NextRequest, NextResponse } from "next/server";
import { estimateServicePrice } from "@/lib/pricing";
import { getPriceBreakdown } from "@/lib/services";
import type { ServiceType } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const input = {
    type: body.type as ServiceType,
    propertySize: body.propertySize,
    rooms: body.rooms,
    distanceKm: body.distanceKm,
    packageName: body.packageName,
  };
  const price = estimateServicePrice(input);
  const breakdown = getPriceBreakdown(input);
  return NextResponse.json({ price, breakdown });
}
