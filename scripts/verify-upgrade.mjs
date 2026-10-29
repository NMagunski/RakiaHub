import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {pg_trgm} from '@electric-sql/pglite/contrib/pg_trgm';
const directory=process.argv[2];
if(!directory)throw new Error('Supply the private backup directory.');
const schema=JSON.parse(await readFile(path.join(directory,'schema.json'),'utf8'));
const manifest=JSON.parse(await readFile(path.join(directory,'manifest.json'),'utf8'));
const db=new PGlite({extensions:{pg_trgm}});
const identifier=value=>'"'+value.replaceAll('"','""')+'"';
await db.exec(`create role anon;create role authenticated;create schema auth;create schema storage;create schema extensions;
create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function auth.role() returns text language sql stable as $$select current_user::text$$;
create table storage.buckets(id text primary key,name text,public boolean);create table storage.objects(id uuid,bucket_id text,name text);
create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
create extension pg_trgm with schema extensions;`);
const originals={};
for(const name of Object.keys(manifest.tables)){
 const columns=schema.columns.filter(column=>column.table_name===name).map(column=>{
  const type=column.data_type==='ARRAY'?'text[]':column.data_type;
  return `${identifier(column.column_name)} ${type}${column.column_default?' default '+column.column_default:''}${column.is_nullable==='NO'?' not null':''}`;
 });
 await db.exec(`create table public.${identifier(name)} (${columns.join(',')});`);
 originals[name]=JSON.parse(await readFile(path.join(directory,name+'.json'),'utf8'));
}
for(const profile of originals.profiles)await db.query('insert into auth.users(id) values($1)',[profile.id]);
for(const [name,rows] of Object.entries(originals)){
 if(rows.length)await db.query(`insert into public.${identifier(name)} select * from json_populate_recordset(null::public.${identifier(name)},$1::json)`,[JSON.stringify(rows)]);
}
for(const constraint of schema.constraints)await db.exec(`alter table public.${constraint.table_name.split('.').map(identifier).join('.')} add constraint ${identifier(constraint.conname)} ${constraint.definition};`);
for(const fn of schema.functions)await db.exec(fn.definition);
for(const trigger of schema.triggers)await db.exec(trigger.definition);
for(const name of Object.keys(originals))await db.exec(`alter table public.${identifier(name)} enable row level security;`);
for(const policy of schema.policies){
 const roles=policy.roles.map(identifier).join(',');
 await db.exec(`create policy ${identifier(policy.policyname)} on public.${identifier(policy.tablename)} for ${policy.cmd} to ${roles}${policy.qual?' using ('+policy.qual+')':''}${policy.with_check?' with check ('+policy.with_check+')':''};`);
}
const release=await readFile('supabase/releases/20261028_activate_upgrade.sql','utf8');
await db.exec(release);
await db.exec(release);
for(const [name,rows] of Object.entries(originals)){
 const current=(await db.query(`select * from public.${identifier(name)}`)).rows;
 assert.equal(current.length,rows.length,`${name}: count changed`);
 const byId=new Map(current.map(row=>[row.id,row]));
 for(const row of rows){
  const after=byId.get(row.id);assert.ok(after,`${name}: original ID missing`);
  for(const [key,value] of Object.entries(row)){
   if(name==='rakija'&&['global_rating','rating_count','updated_at'].includes(key))continue;
   if(schema.columns.find(c=>c.table_name===name&&c.column_name===key)?.data_type==='timestamp with time zone')assert.equal(new Date(after[key]).getTime(),new Date(value).getTime(),`${name}.${key}`);
   else if(value!==null&&schema.columns.find(c=>c.table_name===name&&c.column_name===key)?.data_type==='numeric')assert.equal(Number(after[key]),Number(value),`${name}.${key}`);
   else assert.deepEqual(after[key],value,`${name}.${key}`);
  }
 }
}
console.log('PASS: actual live schema/data snapshot upgraded twice in isolated PostgreSQL; all original IDs, notes, privacy, profiles, reactions and wishlists preserved.');
console.log(JSON.stringify({preserved:Object.fromEntries(Object.entries(originals).map(([name,rows])=>[name,rows.length]))}));
await db.close();
