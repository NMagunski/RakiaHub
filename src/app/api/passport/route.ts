import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const client = createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({error:"Unauthorized"},{status:401});
  const rows: unknown[] = [];
  for (let offset=0;;offset+=500) {
    const {data,error} = await client.from("ratings").select("*, rakija:rakija_id(*)").eq("user_id",user.id).order("id").range(offset,offset+499);
    if (error) return NextResponse.json({error:"Дневникът не може да бъде зареден. Проверете миграциите."},{status:503});
    rows.push(...data); if(data.length<500) break;
  }
  const [{data:countries,error:ce},{data:regions,error:re}] = await Promise.all([client.from("countries").select("*"),client.from("origin_regions").select("*")]);
  if(ce||re) return NextResponse.json({error:"Произходът не е достъпен. Проверете миграциите."},{status:503});
  const {data:wishlist,error:wishlistError}=await client.from("wishlists").select("id, rakija:rakija_id(*)").eq("user_id",user.id).order("created_at",{ascending:false});
  if(wishlistError)return NextResponse.json({error:"Списъкът за пробване не е достъпен."},{status:503});
  const tastings = await Promise.all(rows.map(async row => {
    const entry = row as { photo_path?: string; photo_display_consent?: boolean };
    if (!entry.photo_path || !entry.photo_display_consent) return row;
    const {data} = await client.storage.from("tasting-photos").createSignedUrl(entry.photo_path, 300);
    return {...entry, photo_url:data?.signedUrl};
  }));
  return NextResponse.json({tastings,countries,regions,wishlist},{headers:{"Cache-Control":"private, no-store"}});
}
