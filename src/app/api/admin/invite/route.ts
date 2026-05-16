import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient, isValidEmailForCompany } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  // Verify the caller is an authenticated admin
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callerClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user: caller } } = await callerClient.auth.getUser(token);
  if (!caller || caller.user_metadata?.company !== "all") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, company } = await req.json();
  if (!email || !company) {
    return NextResponse.json({ error: "email and company are required" }, { status: 400 });
  }

  if (!isValidEmailForCompany(email, company)) {
    return NextResponse.json(
      { error: `Email domain does not match the selected company.` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { company },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
