create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(current_setting('request.jwt.claims', true),'{}')::jsonb $$;
grant usage on schema auth to anon, authenticated; grant execute on all functions in schema auth to anon, authenticated;
grant usage on schema public to anon, authenticated;
create publication supabase_realtime;
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','coach@gym.com'),('00000000-0000-0000-0000-00000000000b','sarah@x.com'),('00000000-0000-0000-0000-00000000000c','bob@x.com'),('00000000-0000-0000-0000-00000000000d','stranger@x.com');
