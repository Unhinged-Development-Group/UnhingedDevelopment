import { createAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { name, email, message } = body as Record<string, unknown>;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof message !== "string" || !message.trim()
  ) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("contact_submissions")
    .insert({ name: name.trim(), email: email.trim(), message: message.trim() });

  if (error) {
    console.error("contact_submissions insert error:", error);
    return NextResponse.json({ error: "Failed to submit — please try again" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
