-- RAKIQ Auth diagnostics. Run in Supabase SQL Editor; read-only, no user data.
-- Pair results with Auth/Postgres logs at the failed signup/login timestamp.
begin transaction read only;

-- Confirm required application table and schema exist.
select to_regclass('public.profiles') as profiles_table,
       to_regclass('auth.users') as auth_users_table;
select table_schema,table_name,column_name,data_type,is_nullable,column_default
from information_schema.columns
where (table_schema='public' and table_name='profiles')
order by ordinal_position;

-- Actual INSERT/UPDATE triggers, their execution identity and full definitions.
-- No credentials, tokens, password hashes or user records are selected.
select n.nspname as table_schema,c.relname as table_name,t.tgname,
       pg_get_triggerdef(t.oid,true) as trigger_definition,
       p.oid::regprocedure as function_name,
       pg_get_userbyid(p.proowner) as function_owner,
       p.prosecdef as security_definer,p.proconfig as function_settings,
       pg_get_functiondef(p.oid) as function_definition
from pg_trigger t
join pg_class c on c.oid=t.tgrelid
join pg_namespace n on n.oid=c.relnamespace
join pg_proc p on p.oid=t.tgfoid
where not t.tgisinternal
  and ((n.nspname='auth' and c.relname='users')
       or (n.nspname='public' and c.relname='profiles'))
order by n.nspname,c.relname,t.tgname;

select conname,pg_get_constraintdef(oid,true) as definition
from pg_constraint where conrelid=to_regclass('public.profiles');
select indexname,indexdef from pg_indexes
where schemaname='public' and tablename='profiles';
select policyname,roles,cmd,qual,with_check from pg_policies
where schemaname='public' and tablename='profiles';
select grantee,privilege_type from information_schema.role_table_grants
where table_schema='public' and table_name='profiles';

-- Login may fail independently of signup; inspect its specific Auth log too.
commit;
