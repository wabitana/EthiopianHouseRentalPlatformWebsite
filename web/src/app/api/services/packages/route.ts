import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const packages = await prisma.servicePackage.findMany({
    where: { active: true },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({
    packages: packages.map((p) => ({
      ...p,
      features: JSON.parse(p.features) as string[],
    })),
  });
}
