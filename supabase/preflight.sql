-- READ ONLY. Run on a staging clone before applying 004–008.
-- Retain output for comparison; do not paste secrets into reports.
select version();
select extname,nspname from pg_extension e join pg_namespace n on n.oid=e.extnamespace;
select tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='public' order by tablename,policyname;
select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' order by table_name,ordinal_position;
select conrelid::regclass,conname,pg_get_constraintdef(oid) from pg_constraint where connamespace='public'::regnamespace order by conrelid::regclass::text,conname;
select schemaname,tablename,indexname,indexdef from pg_indexes where schemaname='public' order by tablename,indexname;
select grantee,table_name,privilege_type from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') order by table_name,grantee;
select routine_name,grantee,privilege_type from information_schema.role_routine_grants where routine_schema='public' order by routine_name,grantee;
select count(*) as legacy_tastings,count(distinct user_id) as tasters from public.ratings;
select count(*) as products from public.rakija;
-- Unknown permissive policies can widen access despite new policies. Review them
-- against 001 and remove/restrict only after confirming the intended live contract.
-- Review any UNIQUE INDEX/constraint on ratings(user_id,rakija_id): the journal
-- needs multiple rows per pair. 004 aborts for known unexpected constraints.
