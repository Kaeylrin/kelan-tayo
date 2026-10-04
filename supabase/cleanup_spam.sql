-- One-time cleanup of bot-created rooms and members.
-- Supabase Dashboard -> SQL Editor. Run each STEP on its own (select the
-- step's text and press Run), in order. Every step is small enough not to
-- time out in the dashboard.

-- ===== STEP 1: indexes (makes everything below fast; also used by the app) =====
create index if not exists members_room_id_idx on public.members (room_id);
create index if not exists availability_room_id_idx on public.availability (room_id);
create index if not exists availability_member_id_idx on public.availability (member_id);
create index if not exists rooms_creator_member_id_idx on public.rooms (creator_member_id);


-- ===== STEP 2: build the list of spam rooms =====
drop table if exists public._spam_rooms;
create table public._spam_rooms as
  select r.id from public.rooms r
  where r.name in ('Hello Wrenier Carillo', '60.347113, 120.080800')
     or r.name ~ '^\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+\s*$'                  -- coordinate-style names
     or (not exists (select 1 from public.members m where m.room_id = r.id)
         and r.created_at < now() - interval '1 day')                   -- empty, abandoned rooms
  union
  select room_id from public.members group by room_id having count(*) > 50;  -- no real group is this big
alter table public._spam_rooms add primary key (id);
alter table public._spam_rooms enable row level security;               -- keep it private


-- ===== STEP 3: preview (read-only) — check these numbers look right =====
select
  (select count(*) from public._spam_rooms) as rooms_to_delete,
  (select count(*) from public.rooms) - (select count(*) from public._spam_rooms) as rooms_left;


-- ===== STEP 4: delete spam members — run REPEATEDLY until it says 0 rows =====
update public.rooms set creator_member_id = null
  where id in (select id from public._spam_rooms) and creator_member_id is not null;
delete from public.availability
  where id in (select a.id from public.availability a
               join public._spam_rooms s on s.id = a.room_id limit 20000);
delete from public.members
  where id in (select m.id from public.members m
               join public._spam_rooms s on s.id = m.room_id limit 20000);


-- ===== STEP 5: delete spam rooms — run REPEATEDLY until it says 0 rows =====
delete from public.rooms
  where id in (select s.id from public._spam_rooms s
               join public.rooms r on r.id = s.id limit 20000);


-- ===== STEP 6: bot-named members in otherwise real rooms =====
update public.rooms set creator_member_id = null
  where creator_member_id in (select id from public.members where display_name in ('WRENIER CARILLO_', '?????????'));
delete from public.availability
  where member_id in (select id from public.members where display_name in ('WRENIER CARILLO_', '?????????'));
delete from public.members where display_name in ('WRENIER CARILLO_', '?????????');


-- ===== STEP 7: tidy up =====
drop table if exists public._spam_rooms;
