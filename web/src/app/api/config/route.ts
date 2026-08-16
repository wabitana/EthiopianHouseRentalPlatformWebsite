import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const token = req.cookies.get("delala_token")?.value;

  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/cms`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy config PATCH failed:", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 503 });
  }
}
