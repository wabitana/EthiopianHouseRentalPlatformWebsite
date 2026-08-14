import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sub-admin/listings - Fetch properties for Sub-Admin review
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const city = searchParams.get("city");

    const whereClause: any = {};
    if (status !== "ALL") {
      whereClause.status = status;
    }
    if (city) {
      whereClause.city = city;
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        inspections: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        verifiedBySubAdmin: {
          select: { id: true, name: true, email: true, assignedRegion: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const pendingCount = await prisma.property.count({
      where: { status: "PENDING" },
    });
    const approvedCount = await prisma.property.count({
      where: { status: "APPROVED" },
    });
    const rejectedCount = await prisma.property.count({
      where: { status: "REJECTED" },
    });

    return NextResponse.json({
      success: true,
      properties,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: properties.length,
      },
    });
  } catch (error: any) {
    console.error("API Sub-Admin Listings Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST /api/sub-admin/listings - Execute property verification approval/rejection
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, status, notes, subAdminId, subAdminName } = body;

    if (!propertyId || !status) {
      return NextResponse.json(
        { success: false, error: "propertyId and status are required" },
        { status: 400 }
      );
    }

    // Find property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    // Find subAdmin user
    const subAdminUser = subAdminId
      ? await prisma.user.findUnique({ where: { id: subAdminId } })
      : await prisma.user.findFirst({ where: { role: "SUB_ADMIN" } });

    const activeSubAdminId = subAdminUser ? subAdminUser.id : undefined;
    const activeSubAdminName = subAdminName || subAdminUser?.name || "Regional Sub-Admin";

    // Update Property status
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        status,
        verifiedBySubAdminId: activeSubAdminId,
      },
    });

    // Create Inspection Log Record
    if (activeSubAdminId) {
      await prisma.propertyInspection.create({
        data: {
          propertyId,
          subAdminId: activeSubAdminId,
          subAdminName: activeSubAdminName,
          status,
          notes: notes || `Property inspection set to ${status}`,
          checklistJson: JSON.stringify({
            titleDeedVerified: true,
            physicalInspectionDone: true,
            photosMatchLocation: true,
            landlordIdentityVerified: true,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: `Property '${property.title}' status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("API Sub-Admin Verification Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify property" },
      { status: 500 }
    );
  }
}
