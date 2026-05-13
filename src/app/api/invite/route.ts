import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = randomBytes(12).toString("hex");
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("invite_links")
    .insert({ created_by: user.id, token, expires_at })
    .select("token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ token: data.token });
}

type InviteRow = {
  id: string;
  created_by: string;
  used_by: string | null;
  expires_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
};

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

  const supabase = createClient();
  const { data } = await supabase
    .from("invite_links")
    .select("id, created_by, used_by, expires_at, profiles:created_by(username, avatar_url)")
    .eq("token", token)
    .single() as unknown as { data: InviteRow | null };

  if (!data) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  if (data.used_by) return NextResponse.json({ error: "Already used" }, { status: 410 });
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: "Expired" }, { status: 410 });

  return NextResponse.json(data);
}
