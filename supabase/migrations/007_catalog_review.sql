begin;
alter table public.rakija add column if not exists origin_source text;
alter table public.rakija add column if not exists origin_reviewed_at timestamptz;
create or replace function public.toggle_wishlist(p_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Unauthorized'; end if;
 if not exists(select 1 from public.rakija where id=p_id and (type in('commercial','personal') or added_by=uid)) then raise exception 'Missing product'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||p_id::text,5));
 if exists(select 1 from public.wishlists where user_id=uid and rakija_id=p_id) then
 delete from public.wishlists where user_id=uid and rakija_id=p_id;return false;
 end if;
 insert into public.wishlists(user_id,rakija_id) values(uid,p_id);return true;
end $$;
revoke all on function public.toggle_wishlist(uuid) from public,anon;
grant execute on function public.toggle_wishlist(uuid) to authenticated;
drop policy if exists "rakija own homemade" on public.rakija;
create policy "rakija own homemade" on public.rakija for select using(type='homemade' and added_by=auth.uid());
-- Provenance audit; only reviewed records, never inferred from unverified claims.
create table if not exists public.catalog_audit(id uuid primary key default gen_random_uuid(),product_id uuid,actor uuid,action text not null,before_data jsonb,after_data jsonb,created_at timestamptz not null default now());
alter table public.catalog_audit enable row level security;
drop policy if exists "audit admin read" on public.catalog_audit;
create policy "audit admin read" on public.catalog_audit for select using(public.is_catalog_admin());
create or replace function public.audit_catalog_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.catalog_audit(product_id,actor,action,before_data,after_data) values(coalesce(new.id,old.id),auth.uid(),tg_op,case when tg_op<>'INSERT' then to_jsonb(old) end,case when tg_op<>'DELETE' then to_jsonb(new) end);
 return null;
end $$;
drop trigger if exists catalog_audit on public.rakija;
create trigger catalog_audit after insert or update or delete on public.rakija for each row execute function public.audit_catalog_change();
commit;
