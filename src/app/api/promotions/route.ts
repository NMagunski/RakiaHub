import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, suggestion_id } = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const { data: suggestion, error: fetchError } = await supabase
    .from("promotion_suggestions")
    .select("id, rakija_id, status")
    .eq("id", suggestion_id)
    .single();

  if (fetchError || !suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (suggestion.status !== "pending") return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("promotion_suggestions")
    .update({ status: action === "approve" ? "approved" : "rejected", reviewed_by: user.id, reviewed_at: now })
    .eq("id", suggestion_id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  if (action === "approve") {
    const { error: rakijaError } = await supabase
      .from("rakija")
      .update({ type: "commercial", is_verified: true })
      .eq("id", suggestion.rakija_id);

    if (rakijaError) return NextResponse.json({ error: rakijaError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
