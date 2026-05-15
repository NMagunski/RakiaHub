import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rakijaId } = await req.json();
  if (!rakijaId) return NextResponse.json({ error: "Missing rakijaId" }, { status: 400 });

  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("rakija_id", rakijaId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlists").delete().eq("id", existing.id);
    return NextResponse.json({ added: false });
  }

  await supabase.from("wishlists").insert({ user_id: user.id, rakija_id: rakijaId });
  return NextResponse.json({ added: true });
}
