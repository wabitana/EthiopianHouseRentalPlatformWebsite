import { NextResponse } from "next/server";
import { getCmsConfig } from "@/lib/cms";

export async function GET() {
  const config = await getCmsConfig();
  return NextResponse.json({ config });
}
