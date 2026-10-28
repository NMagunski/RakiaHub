import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rakijaId } = await req.json();
  if (!rakijaId) return NextResponse.json({ error: "Missing rakijaId" }, { status: 400 });

  const {data,error}=await supabase.rpc("toggle_wishlist",{p_id:rakijaId});
  if(error)return NextResponse.json({error:"Списъкът не беше обновен."},{status:400});
  return NextResponse.json({added:data});
}
