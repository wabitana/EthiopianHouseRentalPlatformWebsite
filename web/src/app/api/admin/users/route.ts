import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - List all platform users and role metrics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const search = searchParams.get("search") || "";

    const whereClause: any = {};
    if (roleFilter && roleFilter !== "ALL") {
      whereClause.role = roleFilter;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        city: true,
        assignedRegion: true,
        createdAt: true,
        _count: {
          select: {
            properties: true,
            verifiedProperties: true,
            inspections: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      total: await prisma.user.count(),
      admin: await prisma.user.count({ where: { role: "ADMIN" } }),
      subAdmin: await prisma.user.count({ where: { role: "SUB_ADMIN" } }),
      vendor: await prisma.user.count({ where: { role: "VENDOR" } }),
      customer: await prisma.user.count({ where: { role: "CUSTOMER" } }),
    };

    return NextResponse.json({
      success: true,
      users,
      counts,
    });
  } catch (error: any) {
    console.error("API Admin Users Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user role or region
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, role, assignedRegion, active } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (assignedRegion !== undefined) updateData.assignedRegion = assignedRegion;
    if (active !== undefined) updateData.active = active;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        assignedRegion: true,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${updatedUser.name} updated to role ${updatedUser.role}`,
    });
  } catch (error: any) {
    console.error("API Admin Update User Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
