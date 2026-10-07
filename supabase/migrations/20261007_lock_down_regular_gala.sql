-- Kelan Tayo v1.5.0: close the Regular Gala tables to the public key.
--
-- Why: before v1.5.0 the browser wrote to the gala tables directly with the
-- public (anon) key and a magic-link session. From v1.5.0 every gala read and
-- write goes through api/gala.js, which checks the session and uses the
-- service role key. Members' emails are no longer exposed to each other.
--
-- Run AFTER v1.5.0 is deployed. Paste into Supabase Dashboard -> SQL Editor
-- -> Run. Safe to re-run.

begin;

-- 1. No direct access for anon or signed-in users; only the service role.
do $$
declare
  t text;
  p record;
begin
  foreach t in array array['profiles', 'regular_galas', 'gala_members', 'gala_patterns', 'gala_exceptions'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- 2. Normalise values the old client wrote ('Skip'/'Add', 'active'). Any old
--    check constraints on these columns are replaced with ones matching the API.
do $$
declare c record;
begin
  for c in
    select con.conname, rel.relname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public' and con.contype = 'c'
      and ((rel.relname = 'gala_exceptions' and pg_get_constraintdef(con.oid) ilike '%type%')
        or (rel.relname = 'regular_galas' and pg_get_constraintdef(con.oid) ilike '%status%'))
  loop
    execute format('alter table public.%I drop constraint %I', c.relname, c.conname);
  end loop;
end $$;
update public.gala_exceptions set type = lower(type) where type <> lower(type);
update public.regular_galas set status = 'pending' where status is null or status not in ('pending', 'confirmed');
alter table public.gala_exceptions add constraint gala_exceptions_type_check check (type in ('skip', 'add'));
alter table public.regular_galas add constraint regular_galas_status_check check (status in ('pending', 'confirmed'));

-- 3. One membership per person per gala, one pattern row per weekday.
--    Duplicates (possible with the old client) are removed first, keeping the newest.
delete from public.gala_members a
  using public.gala_members b
  where a.gala_id = b.gala_id and a.profile_id = b.profile_id
    and (coalesce(a.joined_at, 'epoch'), a.ctid) < (coalesce(b.joined_at, 'epoch'), b.ctid);
delete from public.gala_patterns a
  using public.gala_patterns b
  where a.gala_id = b.gala_id and a.profile_id = b.profile_id and a.weekday = b.weekday
    and (coalesce(a.updated_at, 'epoch'), a.ctid) < (coalesce(b.updated_at, 'epoch'), b.ctid);
create unique index if not exists gala_members_gala_profile_key on public.gala_members (gala_id, profile_id);
create unique index if not exists gala_patterns_gala_profile_weekday_key on public.gala_patterns (gala_id, profile_id, weekday);

-- 4. Indexes for the lookups api/gala.js makes.
create index if not exists gala_members_profile_id_idx on public.gala_members (profile_id);
create index if not exists gala_exceptions_gala_date_idx on public.gala_exceptions (gala_id, date);
create index if not exists regular_galas_created_by_idx on public.regular_galas (created_by);

-- 5. Length limits (NOT VALID = only checked for new/changed rows).
alter table public.regular_galas drop constraint if exists regular_galas_name_length;
alter table public.regular_galas add constraint regular_galas_name_length
  check (char_length(name) between 1 and 60) not valid;
alter table public.profiles drop constraint if exists profiles_display_name_length;
alter table public.profiles add constraint profiles_display_name_length
  check (char_length(display_name) between 1 and 40) not valid;
alter table public.gala_exceptions drop constraint if exists gala_exceptions_note_length;
alter table public.gala_exceptions add constraint gala_exceptions_note_length
  check (note is null or char_length(note) <= 120) not valid;

commit;
