import {createClient} from '@supabase/supabase-js';
import {readFile} from 'node:fs/promises';
const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
// Exact pre-existing country identifiers only; this does not verify a region.
for(const [name,id] of [['Bulgaria','BG'],['Serbia','RS'],['North Macedonia','MK']]){
 const {error}=await client.from('rakija').update({country_id:id}).eq('type','commercial').eq('country',name).is('country_id',null);
 if(error)throw new Error('Country normalization failed.');
}
const review=JSON.parse(await readFile('supabase/data/reviewed-origin-troyan.json','utf8'));
const {data,error}=await client.from('rakija').update({country_id:review.country_id,region_id:review.region_id,origin_verified:true,origin_source:review.source,origin_reviewed_at:new Date().toISOString()}).in('id',review.product_ids).eq('type','commercial').eq('producer',review.producer).eq('fruit',review.fruit).is('region_id',null).select('id');
if(error)throw new Error('Reviewed-origin update failed.');
console.log(`Verified origin linked for ${data.length} explicitly reviewed products; existing product verification status unchanged.`);
