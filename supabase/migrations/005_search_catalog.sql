begin;
create or replace function public.search_normalize(value text) returns text language sql immutable set search_path='' as $$
 select trim(regexp_replace(translate(lower(coalesce(value,'')),'абвгдезийклмнопрстуфъь','abvgdeziyklmnoprstufay'),'[^a-zа-я0-9]+',' ','g'));
$$;
-- Digraphs are explicit, deterministic aliases; no inferred geography.
create or replace function public.catalog_key(value text) returns text language sql immutable set search_path='' as $$
 select public.search_normalize(replace(replace(replace(replace(replace(replace(replace(replace(lower(coalesce(value,'')),'щ','sht'),'ш','sh'),'ч','ch'),'ц','ts'),'ж','zh'),'ю','yu'),'я','ya'),'х','h'));
$$;
alter table public.rakija add column if not exists normalized_name text generated always as (public.catalog_key(name)) stored;
alter table public.rakija add column if not exists normalized_producer text generated always as (public.catalog_key(producer)) stored;
create index if not exists rakija_identity_idx on public.rakija(normalized_name,normalized_producer);
-- Supabase may install pg_trgm in extensions rather than public.
do $block$
declare ns text;
begin
 select n.nspname into ns from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pg_trgm';
 execute format($fn$create or replace function public.catalog_similarity(text,text) returns real language sql immutable set search_path='' as 'select %I.similarity($1,$2)'$fn$,ns);
 execute format($idx$create index if not exists rakija_search_trgm on public.rakija using gin (public.catalog_key(name||' '||coalesce(producer,'')||' '||coalesce(region,'')) %I.gin_trgm_ops)$idx$,ns);
end $block$;
drop function if exists public.search_catalog(text,text,text,text,boolean,text,int);
create or replace function public.search_catalog(q text default '',fruit_filter text default null,country_filter text default null,region_filter text default null,verified_filter boolean default false,sort_key text default 'rating_count',page_offset int default 0,tried_only boolean default false)
returns setof public.rakija language sql stable security invoker set search_path='' as $$
 select k.* from public.rakija k
 where k.type in ('commercial','personal') and (not tried_only or exists(select 1 from public.ratings r where r.rakija_id=k.id and r.user_id=auth.uid())) and (fruit_filter is null or k.fruit=fruit_filter)
 and (country_filter is null or k.country_id=country_filter)
 and (region_filter is null or k.region_id=region_filter)
 and (not verified_filter or k.is_verified)
 and (trim(q)='' or (public.catalog_key(q)<>'' and (strpos(public.catalog_key(k.name||' '||coalesce(k.producer,'')||' '||coalesce(k.region,'')),public.catalog_key(q))>0
 or exists(select 1 from public.origin_regions r where r.id=k.region_id and strpos(public.catalog_key(r.name),public.catalog_key(q))>0)
 or exists(select 1 from unnest(k.aliases) a where strpos(public.catalog_key(a),public.catalog_key(q))>0)
 or (length(q)>3 and public.catalog_similarity(public.catalog_key(k.name),public.catalog_key(q))>.22))))
 order by case when sort_key='name' then k.name end asc,
 case when sort_key='global_rating' then k.global_rating end desc nulls last,
 k.rating_count desc,k.id limit 40 offset greatest(0,least(page_offset,100000));
$$;
revoke all on function public.search_catalog(text,text,text,text,boolean,text,int,boolean) from public,anon;
grant execute on function public.search_catalog(text,text,text,text,boolean,text,int,boolean) to authenticated;

create table if not exists public.catalog_imports (
 id uuid primary key default gen_random_uuid(), source text not null, fetched_at timestamptz not null,
 external_id text not null, payload jsonb not null, status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), unique(source,external_id)
);
alter table public.catalog_imports enable row level security;
drop policy if exists "imports admin" on public.catalog_imports;
create policy "imports admin" on public.catalog_imports for all using(public.is_catalog_admin()) with check(public.is_catalog_admin());
-- Merge keeps journal IDs/reactions and consolidates memberships without duplicate errors.
create or replace function public.merge_products(source_id uuid,target_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_catalog_admin() then raise exception 'Forbidden'; end if;
 if source_id=target_id then raise exception 'Identical products'; end if;
 perform id from public.rakija where id in(source_id,target_id) order by id for update;
 if not exists(select 1 from public.rakija where id=source_id) or not exists(select 1 from public.rakija where id=target_id) then raise exception 'Missing product'; end if;
 update public.ratings set rakija_id=target_id where rakija_id=source_id;
 insert into public.wishlists(user_id,rakija_id) select user_id,target_id from public.wishlists where rakija_id=source_id on conflict(user_id,rakija_id) do nothing;
 insert into public.personal_entries(owner_id,rakija_id) select owner_id,target_id from public.personal_entries where rakija_id=source_id on conflict(rakija_id,owner_id) do nothing;
 update public.rakija set aliases=aliases||array(select name from public.rakija where id=source_id) where id=target_id;
 delete from public.rakija where id=source_id;
 perform public.recalculate_product(target_id);
end $$;
revoke all on function public.merge_products(uuid,uuid) from public,anon;
grant execute on function public.merge_products(uuid,uuid) to authenticated;
commit;
