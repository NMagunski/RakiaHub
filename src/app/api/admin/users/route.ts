import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteUserData } from "@/lib/deleteUser";

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  if (userId === user.id) return NextResponse.json({ error: "Cannot delete yourself via admin panel" }, { status: 400 });

  const admin = createAdminClient();
  await deleteUserData(admin, userId);

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const client = createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data:profile}=await client.from("profiles").select("is_admin").eq("id",user.id).single();
  if(!profile?.is_admin)return NextResponse.json({error:"Forbidden"},{status:403});
  const {userId,isAdmin}=await req.json();
  if(typeof userId!=="string"||typeof isAdmin!=="boolean"||userId===user.id)return NextResponse.json({error:"Invalid change"},{status:400});
  const {error}=await createAdminClient().from("profiles").update({is_admin:isAdmin}).eq("id",userId);
  if(error)return NextResponse.json({error:"Role update failed"},{status:500});
  return NextResponse.json({ok:true});
}
