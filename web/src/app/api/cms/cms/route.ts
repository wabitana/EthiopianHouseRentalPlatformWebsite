import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCmsConfig } from "@/lib/cms";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = await getCmsConfig();
  return NextResponse.json({ config });
}
