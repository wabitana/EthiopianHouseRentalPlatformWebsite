import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Construct a new FormData to send to the backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const res = await fetch(`${BACKEND}/upload`, {
      method: "POST",
      body: backendFormData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Proxy upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
