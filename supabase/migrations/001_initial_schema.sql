-- ============================================================
-- RAKIQ — Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  display_name text,
  avatar_url  text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: public read"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: insert on signup"
  on public.profiles for insert
  with check (auth.uid() = id and is_admin = false);

-- Auto-create profile row when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'user_' || substr(new.id::text, 1, 8));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- SHARED HELPER
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ────────────────────────────────────────────────────────────
-- RAKIJA
-- ────────────────────────────────────────────────────────────
create table public.rakija (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('commercial', 'personal', 'homemade')),
  name         text not null,
  producer     text,
  fruit        text,
  region       text,
  country      text not null default 'Bulgaria',
  vintage_year smallint,
  abv          numeric(4,1),
  description  text,
  image_url    text,
  is_verified  boolean not null default false,
  added_by     uuid references public.profiles(id) on delete set null,
  global_rating numeric(3,1),
  rating_count  integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.rakija enable row level security;

create policy "rakija: read commercial and personal"
  on public.rakija for select
  using (
    auth.role() = 'authenticated'
    and type in ('commercial', 'personal')
  );

create policy "rakija: insert personal"
  on public.rakija for insert
  with check (
    auth.uid() = added_by
    and type = 'personal'
  );

create policy "rakija: update own personal"
  on public.rakija for update
  using (auth.uid() = added_by and type = 'personal')
  with check (auth.uid() = added_by and type = 'personal');

create policy "rakija: admin full access"
  on public.rakija for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create trigger rakija_updated_at
  before update on public.rakija
  for each row execute procedure public.set_updated_at();


-- ────────────────────────────────────────────────────────────
-- PERSONAL ENTRIES
-- ────────────────────────────────────────────────────────────
create table public.personal_entries (
  id         uuid primary key default gen_random_uuid(),
  rakija_id  uuid not null references public.rakija(id) on delete cascade,
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (rakija_id, owner_id)
);

alter table public.personal_entries enable row level security;

create policy "personal_entries: insert own"
  on public.personal_entries for insert
  with check (owner_id = auth.uid());

create policy "personal_entries: delete own"
  on public.personal_entries for delete
  using (owner_id = auth.uid());


-- ────────────────────────────────────────────────────────────
-- RATINGS
-- ────────────────────────────────────────────────────────────
create table public.ratings (
  id             uuid primary key default gen_random_uuid(),
  rakija_id      uuid not null references public.rakija(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  score          numeric(3,1) not null check (score >= 1 and score <= 10),
  aroma_tags     text[],
  taste_tags     text[],
  finish_tags    text[],
  color_tags     text[],
  aroma_note     text,
  taste_note     text,
  finish_note    text,
  venue_place_id text,
  venue_name     text,
  notes          text,
  is_private     boolean not null default false,
  created_at     timestamptz not null default now()
);

alter table public.ratings enable row level security;

create policy "ratings: read own"
  on public.ratings for select
  using (user_id = auth.uid());

create policy "ratings: insert own"
  on public.ratings for insert
  with check (user_id = auth.uid());

create policy "ratings: delete own"
  on public.ratings for delete
  using (user_id = auth.uid());

-- Recalculate global_rating on commercial rakija after each rating change
create or replace function public.update_global_rating()
returns trigger language plpgsql security definer as $$
declare
  v_rakija_type text;
begin
  select type into v_rakija_type
  from public.rakija
  where id = coalesce(new.rakija_id, old.rakija_id);

  if v_rakija_type = 'commercial' then
    update public.rakija
    set
      global_rating = (
        select round(avg(score)::numeric, 1)
        from public.ratings
        where rakija_id = coalesce(new.rakija_id, old.rakija_id)
      ),
      rating_count = (
        select count(*)
        from public.ratings
        where rakija_id = coalesce(new.rakija_id, old.rakija_id)
      )
    where id = coalesce(new.rakija_id, old.rakija_id);
  end if;

  return null;
end;
$$;

create trigger ratings_update_global
  after insert or delete on public.ratings
  for each row execute procedure public.update_global_rating();


-- ────────────────────────────────────────────────────────────
-- FRIENDSHIPS
-- ────────────────────────────────────────────────────────────
create table public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

alter table public.friendships enable row level security;

create trigger friendships_updated_at
  before update on public.friendships
  for each row execute procedure public.set_updated_at();

create policy "friendships: read own"
  on public.friendships for select
  using (auth.uid() in (requester_id, addressee_id));

create policy "friendships: send request"
  on public.friendships for insert
  with check (requester_id = auth.uid());

create policy "friendships: respond or block"
  on public.friendships for update
  using (addressee_id = auth.uid())
  with check (addressee_id = auth.uid());

create policy "friendships: delete own"
  on public.friendships for delete
  using (auth.uid() in (requester_id, addressee_id));


-- ────────────────────────────────────────────────────────────
-- are_friends helper — defined AFTER friendships table
-- ────────────────────────────────────────────────────────────
create or replace function public.are_friends(uid_a uuid, uid_b uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and (
        (requester_id = uid_a and addressee_id = uid_b)
        or
        (requester_id = uid_b and addressee_id = uid_a)
      )
  );
$$;

-- Now add policies that depend on are_friends
create policy "personal_entries: read own and friends"
  on public.personal_entries for select
  using (
    owner_id = auth.uid()
    or public.are_friends(auth.uid(), owner_id)
  );

create policy "ratings: read friends public"
  on public.ratings for select
  using (
    is_private = false
    and public.are_friends(auth.uid(), user_id)
  );


-- ────────────────────────────────────────────────────────────
-- REACTIONS
-- ────────────────────────────────────────────────────────────
create table public.reactions (
  id        uuid primary key default gen_random_uuid(),
  rating_id uuid not null references public.ratings(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  type      text not null default 'nazdrave' check (type in ('nazdrave')),
  created_at timestamptz not null default now(),
  unique (rating_id, user_id, type)
);

alter table public.reactions enable row level security;

create policy "reactions: read all authenticated"
  on public.reactions for select
  using (auth.role() = 'authenticated');

create policy "reactions: insert own"
  on public.reactions for insert
  with check (user_id = auth.uid());

create policy "reactions: delete own"
  on public.reactions for delete
  using (user_id = auth.uid());


-- ────────────────────────────────────────────────────────────
-- PROMOTION SUGGESTIONS
-- ────────────────────────────────────────────────────────────
create table public.promotion_suggestions (
  id          uuid primary key default gen_random_uuid(),
  rakija_id   uuid not null references public.rakija(id) on delete cascade,
  match_count integer not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (rakija_id)
);

alter table public.promotion_suggestions enable row level security;

create policy "promotion_suggestions: admin only"
  on public.promotion_suggestions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create or replace function public.check_promotion_threshold(p_rakija_id uuid)
returns void language plpgsql security definer as $$
declare
  v_count integer;
  v_type  text;
begin
  select type into v_type from public.rakija where id = p_rakija_id;
  if v_type <> 'personal' then return; end if;

  select count(*) into v_count
  from public.personal_entries
  where rakija_id = p_rakija_id;

  if v_count >= 5 then
    insert into public.promotion_suggestions (rakija_id, match_count)
    values (p_rakija_id, v_count)
    on conflict (rakija_id) do update
      set match_count = excluded.match_count;
  end if;
end;
$$;


-- ────────────────────────────────────────────────────────────
-- INVITE LINKS
-- ────────────────────────────────────────────────────────────
create table public.invite_links (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  token      text unique not null,
  used_by    uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.invite_links enable row level security;

create policy "invite_links: read own"
  on public.invite_links for select
  using (created_by = auth.uid());

create policy "invite_links: create own"
  on public.invite_links for insert
  with check (created_by = auth.uid());

create policy "invite_links: public token lookup"
  on public.invite_links for select
  using (true);


-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('rakija-images', 'rakija-images', true)
on conflict do nothing;

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars: owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "rakija-images: public read"
  on storage.objects for select
  using (bucket_id = 'rakija-images');

create policy "rakija-images: admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'rakija-images'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );
