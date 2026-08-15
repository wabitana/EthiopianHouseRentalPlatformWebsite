import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const configs = await prisma.platformConfig.findMany();
  return NextResponse.json({
    configs: Object.fromEntries(configs.map((c) => [c.key, c.value])),
  });
}

const patchSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = patchSchema.parse(await req.json());
    const config = await prisma.platformConfig.upsert({
      where: { key: data.key },
      update: { value: data.value },
      create: { key: data.key, value: data.value },
    });
    return NextResponse.json({ config });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
