import { NextResponse } from "next/server";
import { defaultCmsConfig } from "@/lib/cms";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/cms`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.config) {
        return NextResponse.json({ config: data.data.config });
      }
    }
  } catch (err) {
    console.error("Backend CMS fetch failed, falling back to static config:", err);
  }
  
  return NextResponse.json({ config: defaultCmsConfig });
}
