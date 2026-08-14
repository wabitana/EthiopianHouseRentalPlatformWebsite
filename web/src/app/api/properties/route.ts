import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/properties - Public property search API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const neighborhood = searchParams.get("neighborhood");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const has3D = searchParams.get("has3D");
    const status = searchParams.get("status") || "APPROVED";

    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.status = status;
    }
    if (city && city !== "ALL") {
      whereClause.city = city;
    }
    if (neighborhood && neighborhood !== "ALL") {
      whereClause.neighborhood = { contains: neighborhood };
    }
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }
    if (bedrooms && bedrooms !== "ALL") {
      whereClause.bedrooms = parseInt(bedrooms, 10);
    }
    if (has3D === "true") {
      whereClause.has3DWalkthrough = true;
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error: any) {
    console.error("API Public Properties Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
