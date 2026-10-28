import type { Database } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (typeof body.score !== "number" || !Number.isFinite(body.score) || body.score < 1 || body.score > 10) {
    return NextResponse.json({ error: "Оценката трябва да е между 1 и 10." }, { status: 400 });
  }
  const { data, error } = await supabase.rpc("save_tasting", { p: body });
  if (error) return NextResponse.json({ error: "Дегустацията не беше запазена. Опитай отново." }, { status: 400 });
  return NextResponse.json({ id: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const allowed = ["aroma_tags", "taste_tags", "finish_tags", "color_tags", "aroma_note", "taste_note", "finish_note", "venue_name", "notes", "is_private", "score", "tasted_at"];
  const patch = Object.fromEntries(allowed.filter(key => Object.prototype.hasOwnProperty.call(body, key)).map(key => [key, body[key]]));
  if ("score" in patch && (typeof patch.score !== "number" || patch.score < 1 || patch.score > 10)) return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  const { data, error } = await supabase.from("ratings").update(patch as Database["public"]["Tables"]["ratings"]["Update"]).eq("id", body.id).eq("user_id", user.id).select("id").maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({error:"Not found"},{status:404});
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
