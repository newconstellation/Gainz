-- Gainz database setup for Supabase.
-- Run this whole file once in your Supabase project: SQL Editor > New query > paste > Run.
-- It is safe to run again after changes; it only creates what is missing and
-- replaces the functions and policies.
--
-- BEFORE RUNNING: change the trainer email on the line marked  >>> TRAINER EMAIL <<<
--
-- How access works
--   * Everyone signs in with an emailed link or code (no passwords).
--   * The email in app_config.trainer_email is the trainer: full access.
--   * A client is anyone whose email the trainer typed on a client record.
--     A client can see and log only their own workouts and programs, edit their
--     own settings (playlist, rest timer), read the exercise library, and take
--     part in the community feed.
--   * Anyone else who signs in sees nothing.

-- ---------- tables ----------

create table if not exists public.app_config (
  key   text primary key,
  value text not null
);

create table if not exists public.members (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text check (role in ('trainer','client')),
  client_id  text,
  created_at timestamptz not null default now()
);
create index if not exists members_client_id_idx on public.members(client_id);

create table if not exists public.docs (
  collection text not null check (collection in ('clients','workouts','programs','templates','posts','comments','likes','exercises','settings')),
  id         text not null check (id ~ '^[A-Za-z0-9_.-]{1,80}$'),
  data       jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object' and pg_column_size(data) < 512000),
  client_id  text,   -- the client this document belongs to (set automatically)
  author     text,   -- who wrote a post, comment or like (set automatically)
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (collection, id)
);
create index if not exists docs_client_idx on public.docs(collection, client_id);
create index if not exists docs_email_idx on public.docs (lower(data->>'email')) where collection = 'clients';

-- >>> TRAINER EMAIL <<<  put the trainer's sign-in email here (lowercase)
insert into public.app_config(key, value) values ('trainer_email', 'trainer@example.com')
on conflict (key) do nothing;
-- To change it later:  update public.app_config set value = 'new@email.com' where key = 'trainer_email';
--   then: delete from public.members where role = 'trainer';  (the new trainer is linked on next sign-in)

-- ---------- helpers ----------

create or replace function public.gainz_is_trainer() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.members where user_id = auth.uid() and role = 'trainer');
$$;

create or replace function public.gainz_my_client() returns text
language sql stable security definer set search_path = public as $$
  select client_id from public.members where user_id = auth.uid() and role = 'client';
$$;

-- Called by the app right after sign-in. Links the signed-in email to the
-- trainer or to a client record, and returns the result.
create or replace function public.gainz_whoami()
returns table(role text, client_id text, email text)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  em  text := lower(coalesce(auth.jwt()->>'email', ''));
  t   text;
  cid text;
begin
  if uid is null or em = '' then
    return;
  end if;
  select value into t from public.app_config where key = 'trainer_email';
  if em = lower(coalesce(t, '')) then
    insert into public.members(user_id, email, role, client_id) values (uid, em, 'trainer', null)
    on conflict (user_id) do update set email = excluded.email, role = 'trainer', client_id = null;
  else
    select d.id into cid from public.docs d
     where d.collection = 'clients' and lower(d.data->>'email') = em and coalesce((d.data->>'archived')::boolean, false) = false
     order by d.updated_at limit 1;
    insert into public.members(user_id, email, role, client_id)
    values (uid, em, case when cid is null then null else 'client' end, cid)
    on conflict (user_id) do update set email = excluded.email,
      role = case when excluded.client_id is null then null else 'client' end,
      client_id = excluded.client_id;
  end if;
  return query select m.role, m.client_id, m.email from public.members m where m.user_id = uid;
end $$;

-- Fills in client_id / author from the document, and stops clients from
-- changing things that are not theirs to change.
create or replace function public.gainz_docs_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  me text := public.gainz_my_client();
  nm text;
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  new.client_id := case new.collection
    when 'clients'  then new.id
    when 'workouts' then new.data->>'clientId'
    when 'programs' then new.data->>'clientId'
    else null end;
  new.author := case when new.collection in ('posts','comments','likes') then new.data->>'author' else null end;

  if not public.gainz_is_trainer() then
    -- a client may not move a document to someone else
    if new.collection in ('clients','workouts','programs') and new.client_id is distinct from me then
      raise exception 'not allowed' using errcode = '42501';
    end if;
    if new.collection in ('posts','comments','likes') and new.author is distinct from me then
      raise exception 'not allowed' using errcode = '42501';
    end if;
    -- a client may not change their own sign-in email, name or archive flag
    if tg_op = 'UPDATE' and new.collection = 'clients' and (
         lower(new.data->>'email') is distinct from lower(old.data->>'email')
      or (new.data->>'name')     is distinct from (old.data->>'name')
      or (new.data->>'archived') is distinct from (old.data->>'archived')) then
      raise exception 'not allowed' using errcode = '42501';
    end if;
    -- only the trainer can pin posts
    if new.collection = 'posts' and coalesce((new.data->>'pinned')::boolean, false) then
      new.data := jsonb_set(new.data, '{pinned}', 'false'::jsonb);
    end if;
  end if;

  -- Stamp the author's name on community items so every client can show it
  -- without being able to read other clients' records.
  if new.collection in ('posts','comments','likes') then
    if new.author = 'trainer' then
      select d.data->>'name' into nm from public.docs d where d.collection = 'settings' and d.id = 'trainer';
    else
      select d.data->>'name' into nm from public.docs d where d.collection = 'clients' and d.id = new.author;
    end if;
    new.data := jsonb_set(new.data, '{authorName}', to_jsonb(coalesce(nm, '')));
  end if;
  return new;
end $$;

drop trigger if exists gainz_docs_stamp on public.docs;
create trigger gainz_docs_stamp before insert or update on public.docs
for each row execute function public.gainz_docs_stamp();

-- ---------- row-level security ----------

alter table public.docs       enable row level security;
alter table public.members    enable row level security;
alter table public.app_config enable row level security;

-- members: you can see your own membership; the trainer can see everyone's
drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated
  using (user_id = (select auth.uid()) or (select public.gainz_is_trainer()));
-- (no insert/update/delete policies: only gainz_whoami() writes this table)

-- app_config: nobody reads or writes it through the API

-- docs: the trainer can do everything
drop policy if exists docs_trainer_all on public.docs;
create policy docs_trainer_all on public.docs for all to authenticated
  using ((select public.gainz_is_trainer()))
  with check ((select public.gainz_is_trainer()));

-- docs: what a client can read
drop policy if exists docs_client_read on public.docs;
create policy docs_client_read on public.docs for select to authenticated
  using (
    (collection in ('exercises','settings','posts','comments','likes') and (select public.gainz_my_client()) is not null)
    or (collection in ('clients','workouts','programs') and client_id = (select public.gainz_my_client()))
  );

-- docs: a client can log their own workouts and update their own settings
drop policy if exists docs_client_update on public.docs;
create policy docs_client_update on public.docs for update to authenticated
  using (collection in ('clients','workouts','programs') and client_id = (select public.gainz_my_client()))
  with check (collection in ('clients','workouts','programs') and client_id = (select public.gainz_my_client()));

-- docs: a client can start a program session (a new workout of their own),
-- and post, comment and like as themselves. Saves are upserts, and Postgres
-- checks the insert rule even when the row already exists, so a client's own
-- clients/workouts/programs rows are listed here too.
drop policy if exists docs_client_insert on public.docs;
create policy docs_client_insert on public.docs for insert to authenticated
  with check (
    (collection in ('clients','workouts','programs') and client_id = (select public.gainz_my_client()))
    or (collection in ('posts','comments','likes') and author = (select public.gainz_my_client()))
  );

drop policy if exists docs_client_change_own on public.docs;
create policy docs_client_change_own on public.docs for update to authenticated
  using (collection in ('posts','comments','likes') and author = (select public.gainz_my_client()))
  with check (collection in ('posts','comments','likes') and author = (select public.gainz_my_client()));

drop policy if exists docs_client_delete_own on public.docs;
create policy docs_client_delete_own on public.docs for delete to authenticated
  using (collection in ('posts','comments','likes') and author = (select public.gainz_my_client()));

-- ---------- grants ----------

revoke all on public.app_config from anon, authenticated;
revoke all on public.members from anon;
revoke all on public.docs from anon;
grant select on public.members to authenticated;
grant select, insert, update, delete on public.docs to authenticated;
revoke execute on function public.gainz_whoami() from public, anon;
grant execute on function public.gainz_whoami() to authenticated;
grant execute on function public.gainz_is_trainer() to authenticated;
grant execute on function public.gainz_my_client() to authenticated;

-- ---------- live updates ----------
-- Lets open screens update when the trainer assigns a workout or a client logs one.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; when undefined_object then null;
end $$;
