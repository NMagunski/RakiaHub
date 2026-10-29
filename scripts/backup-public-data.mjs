import {createClient} from '@supabase/supabase-js';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
process.umask(0o077);
const tables=['profiles','rakija','ratings','reactions','wishlists','personal_entries','friendships','invite_links','promotion_suggestions'];
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Missing Supabase server configuration.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const timestamp=new Date().toISOString();
const directory=path.resolve('.backups','rakiq-'+timestamp.replace(/[:.]/g,'-'));
await mkdir(directory,{recursive:true,mode:0o700});
const manifest={created_at:timestamp,project:new URL(url).host,kind:'public-table-data; auth users and password hashes are not exported',tables:{}};
for(const table of tables){
 const rows=[];
 for(let offset=0;;offset+=500){
  const {data,error}=await client.from(table).select('*').order('id').range(offset,offset+499);
  if(error)throw new Error(`Backup failed for ${table}; no migrations may be applied.`);
  rows.push(...data);if(data.length<500)break;
 }
 const content=JSON.stringify(rows,null,2)+'\n';
 await writeFile(path.join(directory,table+'.json'),content,{mode:0o600});
 manifest.tables[table]={rows:rows.length,sha256:createHash('sha256').update(content).digest('hex')};
}
await writeFile(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({directory,counts:Object.fromEntries(Object.entries(manifest.tables).map(([name,entry])=>[name,entry.rows]))}));
