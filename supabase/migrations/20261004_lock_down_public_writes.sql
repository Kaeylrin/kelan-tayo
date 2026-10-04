-- Kelan Tayo v1.4.0: stop direct database writes from the public (anon) key.
--
-- Why: the anon key ships inside the website bundle, so anyone can read it.
-- Before this migration, that key could insert/update/delete rooms, members
-- and availability directly through the Supabase REST API, skipping our
-- /api routes, Turnstile and every other check. After this migration the
-- public key is read-only, and all writes go through the Vercel API routes,
-- which use the service role key.
--
-- Run AFTER v1.4.0 is deployed (older site versions still write directly).
-- Paste into Supabase Dashboard -> SQL Editor -> Run. Safe to re-run.

begin;

-- 1. Rate limit log used by api/_lib/guard.js (service role only).
create table if not exists public.api_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index if not exists api_rate_limits_lookup
  on public.api_rate_limits (ip_hash, action, created_at desc);
create index if not exists api_rate_limits_created_at
  on public.api_rate_limits (created_at);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon, authenticated;

-- 2. rooms / members / availability: public can read, nobody but the
--    service role can write. Drops every existing policy on these tables
--    first, since the old ones allowed anonymous writes.
do $$
declare
  t text;
  p record;
begin
  foreach t in array array['rooms', 'members', 'availability'] loop
    execute format('alter table public.%I enable row level security', t);
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('create policy "Public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('revoke insert, update, delete, truncate on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- 3. Length limits (NOT VALID = only checked for new/changed rows).
alter table public.rooms drop constraint if exists rooms_name_length;
alter table public.rooms add constraint rooms_name_length
  check (char_length(name) between 1 and 60) not valid;
alter table public.members drop constraint if exists members_display_name_length;
alter table public.members add constraint members_display_name_length
  check (char_length(display_name) between 1 and 40) not valid;

-- 4. Hard cap of 50 members per room, even if the API is bypassed.
create or replace function public.enforce_room_member_cap()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.members where room_id = new.room_id) >= 50 then
    raise exception 'Room is full';
  end if;
  return new;
end $$;
drop trigger if exists members_cap on public.members;
create trigger members_cap before insert on public.members
  for each row execute function public.enforce_room_member_cap();

-- 5. Landing page stats: only count rooms that look like real groups
--    (1 to 50 members).
drop function if exists public.get_public_stats();
create function public.get_public_stats()
returns table (rooms_created bigint, plans_confirmed bigint, members_joined bigint)
language sql stable security definer set search_path = public as $$
  with real_rooms as (
    select r.id, r.status, count(m.id) as member_count
    from rooms r
    join members m on m.room_id = r.id
    group by r.id, r.status
    having count(m.id) between 1 and 50
  )
  select count(*),
         count(*) filter (where status = 'confirmed'),
         coalesce(sum(member_count), 0)::bigint
  from real_rooms;
$$;
revoke all on function public.get_public_stats() from public;
grant execute on function public.get_public_stats() to anon, authenticated;

commit;
