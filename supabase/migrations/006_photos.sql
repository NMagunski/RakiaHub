begin;
alter table public.ratings add column if not exists photo_path text;
alter table public.ratings add column if not exists photo_display_consent boolean not null default false;
insert into storage.buckets(id,name,public) values('tasting-photos','tasting-photos',false) on conflict(id) do nothing;
drop policy if exists "tasting photos owner read" on storage.objects;
create policy "tasting photos owner read" on storage.objects for select using(bucket_id='tasting-photos' and auth.uid()::text=(storage.foldername(name))[1]);
drop policy if exists "tasting photos owner upload" on storage.objects;
create policy "tasting photos owner upload" on storage.objects for insert with check(bucket_id='tasting-photos' and auth.uid()::text=(storage.foldername(name))[1]);
drop policy if exists "tasting photos owner delete" on storage.objects;
create policy "tasting photos owner delete" on storage.objects for delete using(bucket_id='tasting-photos' and auth.uid()::text=(storage.foldername(name))[1]);
create or replace function public.guard_tasting_photo() returns trigger language plpgsql set search_path='' as $$
begin
 if new.photo_path is not null and (not new.photo_display_consent or split_part(new.photo_path,'/',1)<>new.user_id::text) then raise exception 'Invalid photo ownership or consent'; end if;
 return new;
end $$;
drop trigger if exists tasting_photo_guard on public.ratings;
create trigger tasting_photo_guard before insert or update on public.ratings for each row execute function public.guard_tasting_photo();
commit;
