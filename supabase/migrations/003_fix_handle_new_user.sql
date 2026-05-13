-- Fix handle_new_user trigger to read username from signup metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_username text;
begin
  -- Use username from metadata if provided, otherwise generate a default
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    'user_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (id, username)
  values (new.id, v_username)
  on conflict (id) do update set username = excluded.username;

  return new;
end;
$$;
