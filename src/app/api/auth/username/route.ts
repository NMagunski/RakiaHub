import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Guest registration can check a public username without opening profiles RLS.
// Return only availability, never profile IDs, email addresses or account details.
export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  let username: unknown;
  try {
    ({ username } = await request.json());
  } catch {
    return NextResponse.json({ error: "Невалидна заявка." }, { status: 400, headers });
  }
  if (typeof username !== "string" || !/^[a-z0-9_]{3,32}$/.test(username)) {
    return NextResponse.json({ error: "Използвай 3–32 малки латински букви, цифри или _." }, { status: 400, headers });
  }
  try {
    const { data, error } = await createAdminClient()
      .from("profiles").select("id").eq("username", username).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ available: data === null }, { headers });
  } catch {
    return NextResponse.json({ error: "Не успяхме да проверим потребителското име. Опитай отново." }, { status: 503, headers });
  }
}
