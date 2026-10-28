import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
export async function POST(req:NextRequest){
 const client=createClient();const {data:{user}}=await client.auth.getUser();
 if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:profile}=await client.from("profiles").select("is_admin").eq("id",user.id).single();
 if(!profile?.is_admin)return NextResponse.json({error:"Forbidden"},{status:403});
 const body=await req.json();
 if(body.action==='merge'){
 const {error}=await client.rpc("merge_products",{source_id:body.source_id,target_id:body.target_id});
 return NextResponse.json(error?{error:"Сливането не беше извършено."}:{ok:true},{status:error?400:200});
 }
 if(body.action!=="origin"||typeof body.id!=="string"||!['BG','RS','MK'].includes(body.country_id)||typeof body.source!=="string"||!body.source.startsWith('https://'))return NextResponse.json({error:"Невалиден произход или липсва източник."},{status:400});
 const {error}=await client.from("rakija").update({country_id:body.country_id,region_id:body.region_id||null,origin_verified:true,origin_source:body.source,origin_reviewed_at:new Date().toISOString()}).eq("id",body.id);
 return NextResponse.json(error?{error:"Произходът не беше запазен."}:{ok:true},{status:error?400:200});
}
