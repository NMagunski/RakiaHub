import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkPromotionThreshold } from "@/lib/promotionCheck";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    rakija_id,
    score,
    aroma_tags,
    taste_tags,
    finish_tags,
    color_tags,
    aroma_note,
    taste_note,
    finish_note,
    venue_place_id,
    venue_name,
    notes,
    is_private,
    // personal entry fields
    is_new_personal,
    personal_name,
    personal_producer,
    personal_fruit,
  } = body;

  let finalRakijaId = rakija_id;

  // If adding a brand new personal rakija
  if (is_new_personal) {
    const normalName = personal_name?.trim().toLowerCase();
    const normalProducer = (personal_producer ?? "").trim().toLowerCase();

    // Find existing personal rakija with same name+producer
    const { data: existing } = await supabase
      .from("rakija")
      .select("id")
      .eq("type", "personal")
      .ilike("name", normalName)
      .ilike("producer", normalProducer || "%")
      .maybeSingle();

    if (existing) {
      finalRakijaId = existing.id;
    } else {
      const { data: newRakija, error: rErr } = await supabase
        .from("rakija")
        .insert({
          type: "personal",
          name: personal_name.trim(),
          producer: personal_producer?.trim() || null,
          fruit: personal_fruit || null,
          added_by: user.id,
        })
        .select("id")
        .single();

      if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });
      finalRakijaId = newRakija.id;
    }

    // Add to personal_entries for this user
    await supabase
      .from("personal_entries")
      .upsert({ rakija_id: finalRakijaId, owner_id: user.id });

    // Check if enough users have added this for promotion
    await checkPromotionThreshold(supabase, finalRakijaId);
  }

  const ratingPayload = {
    rakija_id: finalRakijaId,
    user_id: user.id,
    score,
    aroma_tags: aroma_tags ?? null,
    taste_tags: taste_tags ?? null,
    finish_tags: finish_tags ?? null,
    color_tags: color_tags ?? null,
    aroma_note: aroma_note ?? null,
    taste_note: taste_note ?? null,
    finish_note: finish_note ?? null,
    venue_place_id: venue_place_id ?? null,
    venue_name: venue_name ?? null,
    notes: notes ?? null,
    is_private: is_private ?? false,
  };

  // Check if user already rated this rakija — update instead of insert
  const { data: existing } = await supabase
    .from("ratings")
    .select("id")
    .eq("user_id", user.id)
    .eq("rakija_id", finalRakijaId)
    .maybeSingle();

  let ratingId: string;

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase RejectExcessProperties rejects valid update payload
    const { data: updated, error } = await supabase
      .from("ratings")
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .update(ratingPayload as never)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ratingId = updated.id;
  } else {
    const { data: inserted, error } = await supabase
      .from("ratings")
      .insert(ratingPayload)
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ratingId = inserted.id;
  }

  return NextResponse.json({ id: ratingId });
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
