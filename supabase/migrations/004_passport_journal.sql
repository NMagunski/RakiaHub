-- RAKIQ upgrade. Apply to a backed-up staging database first, never automatically.
begin;
create extension if not exists pg_trgm;
alter table public.profiles add column if not exists age_verified_at timestamptz;
alter table public.profiles add column if not exists theme text not null default 'amber' check(theme in ('amber','atlas'));
create table if not exists public.wishlists (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 rakija_id uuid not null references public.rakija on delete cascade, created_at timestamptz not null default now(), unique(user_id,rakija_id)
);
alter table public.wishlists enable row level security;
drop policy if exists "wishlist own" on public.wishlists;
create policy "wishlist own" on public.wishlists for all using(user_id=auth.uid()) with check(user_id=auth.uid());

create table if not exists public.countries (id text primary key, name text not null);
insert into public.countries values ('BG','България'),('RS','Сърбия'),('MK','Северна Македония') on conflict do nothing;
create table if not exists public.origin_regions (
 id text primary key, country_id text not null references public.countries, name text not null,
 latitude numeric not null check(latitude between -90 and 90), longitude numeric not null check(longitude between -180 and 180),
 source_url text not null, attribution text not null, kind text not null default 'approximate-locality' check(kind='approximate-locality'), unique(id,country_id)
);
-- Points are locality references, NOT administrative polygons or official spirit regions.
insert into public.origin_regions values
 ('geonames:726320','BG','Троян',42.89427,24.71589,'https://www.geonames.org/726320/','GeoNames, CC BY 4.0','approximate-locality') on conflict do nothing;
alter table public.rakija add column if not exists country_id text references public.countries;
alter table public.rakija add column if not exists region_id text;
alter table public.rakija add column if not exists origin_verified boolean not null default false;
alter table public.rakija add column if not exists aliases text[] not null default '{}';
alter table public.rakija add column if not exists category text not null default 'rakija';
alter table public.rakija add column if not exists image_source text;
alter table public.rakija add column if not exists image_rights text;
alter table public.rakija add column if not exists image_attribution text;
alter table public.rakija add column if not exists origin_claim text;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='rakija_origin_consistency') then alter table public.rakija add constraint rakija_origin_consistency check((region_id is null or country_id is not null) and (not origin_verified or country_id is not null)); end if;
 if not exists(select 1 from pg_constraint where conname='rakija_region_country_fk') then
 alter table public.rakija add constraint rakija_region_country_fk foreign key(region_id,country_id) references public.origin_regions(id,country_id);
 end if;
end $$;
-- No unreviewed free-text origins are mapped. Existing country/region strings remain intact.
alter table public.countries enable row level security;
alter table public.origin_regions enable row level security;
drop policy if exists "country read" on public.countries;
create policy "country read" on public.countries for select using(true);
drop policy if exists "region read" on public.origin_regions;
create policy "region read" on public.origin_regions for select using(true);

-- Use a trigger in addition to RLS: even a permissive legacy UPDATE policy cannot elevate roles.
create or replace function public.guard_profile_fields() returns trigger language plpgsql set search_path='' as $$
begin
 if current_user in ('authenticated','anon') then
   if tg_op='INSERT' and new.is_admin then raise exception 'Protected role'; end if;
   if tg_op='UPDATE' and (new.is_admin is distinct from old.is_admin or new.id<>old.id or new.created_at<>old.created_at or (old.age_verified_at is not null and new.age_verified_at is distinct from old.age_verified_at)) then raise exception 'Protected profile fields'; end if;
 end if;
 if current_user in ('authenticated','anon') and tg_op='UPDATE' and old.age_verified_at is null and new.age_verified_at is not null then new.age_verified_at=now(); end if;
 return new;
end $$;
drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields before insert or update on public.profiles for each row execute function public.guard_profile_fields();
create or replace function public.is_catalog_admin() returns boolean language sql security definer stable set search_path='' as $$
 select exists(select 1 from public.profiles where id=auth.uid() and is_admin);
$$;
create or replace function public.guard_catalog_fields() returns trigger language plpgsql set search_path='' as $$
begin
 if current_user in ('authenticated','anon') and not public.is_catalog_admin() then
   if tg_op='INSERT' then
     if new.is_verified or new.origin_verified or new.country_id is not null or new.region_id is not null or new.image_url is not null or new.global_rating is not null or new.rating_count<>0 then raise exception 'Protected catalog fields'; end if;
   elsif (to_jsonb(new)-array['name','producer','fruit','description','origin_claim','updated_at','normalized_name','normalized_producer']) is distinct from (to_jsonb(old)-array['name','producer','fruit','description','origin_claim','updated_at','normalized_name','normalized_producer']) then raise exception 'Protected catalog fields';
   end if;
 end if;
 return new;
end $$;
drop trigger if exists protect_catalog_fields on public.rakija;
create trigger protect_catalog_fields before insert or update on public.rakija for each row execute function public.guard_catalog_fields();

-- ratings is the historical journal. No copy/backfill: existing IDs and reactions survive.
alter table public.ratings add column if not exists tasted_at timestamptz;
update public.ratings set tasted_at=created_at where tasted_at is null;
alter table public.ratings alter column tasted_at set default now();
alter table public.ratings alter column tasted_at set not null;
alter table public.ratings add column if not exists request_id uuid;
create unique index if not exists ratings_request_id on public.ratings(user_id,request_id) where request_id is not null;
create index if not exists ratings_current_idx on public.ratings(rakija_id,user_id,tasted_at desc,created_at desc,id desc);
-- Abort for an unexpected live uniqueness constraint rather than silently dropping it.
do $$ begin
 if exists(select 1 from pg_constraint where conrelid='public.ratings'::regclass and contype='u' and pg_get_constraintdef(oid) like '%user_id%' and pg_get_constraintdef(oid) like '%rakija_id%') then
 raise exception 'Unexpected user/product uniqueness constraint: review and remove explicitly after backup';
 end if;
end $$;
create or replace view public.current_personal_ratings with (security_invoker=true) as
 select distinct on(user_id,rakija_id) * from public.ratings where user_id=auth.uid() order by user_id,rakija_id,tasted_at desc,created_at desc,id desc;
drop policy if exists "ratings: update own" on public.ratings;
create policy "ratings: update own" on public.ratings for update using(user_id=auth.uid()) with check(user_id=auth.uid());
-- Keep existing owner/friend visibility. Guests receive only the limited RPC below.
create or replace function public.recalculate_product(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,1));
 update public.rakija set global_rating=s.average,rating_count=s.total from (
   select round(avg(score),1) average,count(*)::int total from (
     select distinct on(user_id) score from public.ratings where rakija_id=p_id
     order by user_id,tasted_at desc,created_at desc,id desc
   ) latest
 ) s where id=p_id;
end $$;
create or replace function public.update_global_rating() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op<>'INSERT' then perform public.recalculate_product(old.rakija_id); end if;
 if tg_op<>'DELETE' then perform public.recalculate_product(new.rakija_id); end if;
 return null;
end $$;
drop trigger if exists ratings_update_global on public.ratings;
create trigger ratings_update_global after insert or update or delete on public.ratings for each row execute function public.update_global_rating();
select public.recalculate_product(id) from public.rakija;

-- Atomic journal insertion and missing-product creation, serialized by normalized identity.
create or replace function public.save_tasting(p jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); rid uuid; result uuid; previous public.ratings; nm text; pr text; req uuid; typ text;
begin
 if uid is null then raise exception 'Unauthorized'; end if;
 if jsonb_typeof(p->'score')<>'number' or (p->>'score')::numeric not between 1 and 10 then raise exception 'Invalid score'; end if;
 req:=(p->>'request_id')::uuid;
 if req is not null then
   perform pg_advisory_xact_lock(hashtextextended(uid::text||req::text,2));
   select id into result from public.ratings where user_id=uid and request_id=req;
   if result is not null then return result; end if;
 end if;
 if coalesce((p->>'is_new_personal')::boolean,false) then
   typ:=case when p->>'entry_kind'='homemade' then 'homemade' else 'personal' end;
   nm:=trim(p->>'personal_name'); pr:=nullif(trim(p->>'personal_producer'),'');
   if nm is null or length(nm) not between 1 and 160 then raise exception 'Invalid name'; end if;
   perform pg_advisory_xact_lock(hashtextextended(public.catalog_key(nm)||public.catalog_key(pr),3));
   select id into rid from public.rakija where ((typ='personal' and type in ('personal','commercial')) or (typ='homemade' and type='homemade' and added_by=uid)) and public.catalog_key(name)=public.catalog_key(nm) and public.catalog_key(producer)=public.catalog_key(pr) order by created_at limit 1;
   if rid is null then
     insert into public.rakija(type,name,producer,fruit,added_by,origin_claim) values(typ,nm,pr,p->>'personal_fruit',uid,p->>'origin_claim') returning id into rid;
     if typ='personal' then insert into public.promotion_suggestions(rakija_id,match_count) values(rid,1) on conflict(rakija_id) do nothing; end if;
   end if;
   insert into public.personal_entries(rakija_id,owner_id) values(rid,uid) on conflict(rakija_id,owner_id) do nothing;
   if typ='personal' then
     update public.promotion_suggestions set match_count=(select count(*) from public.personal_entries where rakija_id=rid) where rakija_id=rid and status='pending';
   end if;
 else rid:=(p->>'rakija_id')::uuid;
 end if;
 if not exists(select 1 from public.rakija where id=rid and (type in ('commercial','personal') or added_by=uid)) then raise exception 'Product unavailable'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||rid::text,4));
 select * into previous from public.ratings where user_id=uid and rakija_id=rid order by tasted_at desc,created_at desc,id desc limit 1;
 insert into public.ratings(user_id,rakija_id,score,notes,venue_name,aroma_tags,taste_tags,finish_tags,color_tags,aroma_note,taste_note,finish_note,is_private,tasted_at,request_id,photo_path,photo_display_consent)
 values(uid,rid,(p->>'score')::numeric,p->>'notes',p->>'venue_name',
 array(select jsonb_array_elements_text(case when jsonb_typeof(p->'aroma_tags')='array' then p->'aroma_tags' else '[]' end)),
 array(select jsonb_array_elements_text(case when jsonb_typeof(p->'taste_tags')='array' then p->'taste_tags' else '[]' end)),
 array(select jsonb_array_elements_text(case when jsonb_typeof(p->'finish_tags')='array' then p->'finish_tags' else '[]' end)),
 array(select jsonb_array_elements_text(case when jsonb_typeof(p->'color_tags')='array' then p->'color_tags' else '[]' end)),
 p->>'aroma_note',p->>'taste_note',p->>'finish_note',coalesce((p->>'is_private')::boolean,previous.is_private,true),coalesce((p->>'tasted_at')::timestamptz,now()),req,p->>'photo_path',coalesce((p->>'photo_display_consent')::boolean,false)) returning id into result;
 delete from public.wishlists where user_id=uid and rakija_id=rid;
 return result;
end $$;

create or replace function public.review_suggestion(p_id uuid,p_action text) returns void language plpgsql security definer set search_path='' as $$
declare s public.promotion_suggestions;
begin
 if not public.is_catalog_admin() then raise exception 'Forbidden'; end if;
 if p_action not in ('approve','reject') then raise exception 'Invalid action'; end if;
 select * into s from public.promotion_suggestions where id=p_id for update;
 if s.id is null or s.status<>'pending' then raise exception 'Already reviewed or missing'; end if;
 update public.promotion_suggestions set status=case when p_action='approve' then 'approved' else 'rejected' end,reviewed_by=auth.uid(),reviewed_at=now() where id=p_id;
 if p_action='approve' then
 -- Approval as commercial does not verify source/origin.
 update public.rakija set type='commercial' where id=s.rakija_id;
 perform public.recalculate_product(s.rakija_id);
 end if;
end $$;

create or replace function public.public_profile(p_username text) returns jsonb language sql security definer stable set search_path='' as $$
 select jsonb_build_object('profile',jsonb_build_object('username',username,'display_name',display_name,'avatar_url',avatar_url,'created_at',created_at),
 'ratings',coalesce((select jsonb_agg(x) from (select r.id,r.score,r.created_at,k.id rakija_id,k.name,k.producer,k.fruit from public.ratings r join public.rakija k on k.id=r.rakija_id where r.user_id=p.id and not r.is_private and k.type='commercial' order by r.created_at desc limit 50) x),'[]'::jsonb))
 from public.profiles p where username=p_username limit 1;
$$;
-- Revoke implicit PUBLIC execution on all privileged helpers.
revoke all on function public.recalculate_product(uuid) from public,anon,authenticated;
revoke all on function public.save_tasting(jsonb) from public,anon;
revoke all on function public.review_suggestion(uuid,text) from public,anon;
grant execute on function public.save_tasting(jsonb),public.review_suggestion(uuid,text) to authenticated;
revoke all on function public.public_profile(text) from public;
grant execute on function public.public_profile(text) to anon,authenticated;
grant select on public.countries,public.origin_regions to authenticated,anon;
grant select on public.current_personal_ratings to authenticated;
commit;
