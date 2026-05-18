import { createAdminClient } from "@/lib/supabase-admin";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const trimmed = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  };

  // Store in database
  const supabase = createAdminClient();
  const { error: dbError } = await supabase
    .from("contact_submissions")
    .insert(trimmed);

  if (dbError) {
    console.error("contact_submissions insert error:", dbError);
    return NextResponse.json({ error: "Failed to submit — please try again" }, { status: 500 });
  }

  // Send notification email — non-blocking; DB insert is the source of truth
  resend.emails.send({
    from: "UDG Website <noreply@unhingeddevelopment.uk>",
    to: "contact@unhingeddevelopment.uk",
    subject: `New message from ${trimmed.name}`,
    html: `
      <div style="background:#080808;color:#d4d4d8;font-family:system-ui,sans-serif;padding:32px;border-radius:12px;max-width:560px">
        <p style="color:#D2FF14;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 20px">
          Unhinged Development Group — Contact Form
        </p>
        <h2 style="color:#fff;font-size:22px;margin:0 0 24px">New message from ${trimmed.name}</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding:8px 0 4px;border-top:1px solid #27272a">Name</td>
          </tr>
          <tr>
            <td style="color:#f4f4f5;font-size:14px;padding:0 0 16px">${trimmed.name}</td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding:8px 0 4px;border-top:1px solid #27272a">Email</td>
          </tr>
          <tr>
            <td style="padding:0 0 16px">
              <a href="mailto:${trimmed.email}" style="color:#D2FF14;font-size:14px;text-decoration:none">${trimmed.email}</a>
            </td>
          </tr>
          <tr>
            <td style="color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;padding:8px 0 4px;border-top:1px solid #27272a">Message</td>
          </tr>
          <tr>
            <td style="color:#f4f4f5;font-size:14px;line-height:1.6;padding:0 0 8px;white-space:pre-wrap">${trimmed.message}</td>
          </tr>
        </table>
        <p style="color:#52525b;font-size:11px;margin:24px 0 0;border-top:1px solid #27272a;padding-top:16px">
          Submitted via unhingeddevelopment.uk
        </p>
      </div>
    `,
  }).catch((err) => console.error("Resend error:", err));

  return NextResponse.json({ success: true });
}
