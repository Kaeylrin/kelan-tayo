-- One-time cleanup of bot-created rooms and members.
-- Paste into Supabase Dashboard -> SQL Editor. Run the PREVIEW block first,
-- check the numbers, then run the DELETE block.

-- ===== PREVIEW (read-only) =====
with spam_rooms as (
  select r.id from public.rooms r
  where r.name in ('Hello Wrenier Carillo', '60.347113, 120.080800')
     or r.name ~ '^\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+\s*$'                  -- coordinate-style names
     or r.id in (select room_id from public.members group by room_id having count(*) > 50)
     or (not exists (select 1 from public.members m where m.room_id = r.id)
         and r.created_at < now() - interval '1 day')                   -- empty, abandoned rooms
)
select
  (select count(*) from spam_rooms) as rooms_to_delete,
  (select count(*) from public.members where room_id in (select id from spam_rooms)) as members_to_delete,
  (select count(*) from public.rooms) - (select count(*) from spam_rooms) as rooms_left;


-- ===== DELETE =====
-- set statement_timeout = '15min';
-- begin;
-- create temp table spam_rooms on commit drop as
--   select r.id from public.rooms r
--   where r.name in ('Hello Wrenier Carillo', '60.347113, 120.080800')
--      or r.name ~ '^\s*-?\d+\.\d+\s*,\s*-?\d+\.\d+\s*$'
--      or r.id in (select room_id from public.members group by room_id having count(*) > 50)
--      or (not exists (select 1 from public.members m where m.room_id = r.id)
--          and r.created_at < now() - interval '1 day');
-- update public.rooms set creator_member_id = null where id in (select id from spam_rooms);
-- delete from public.availability where room_id in (select id from spam_rooms);
-- delete from public.members where room_id in (select id from spam_rooms);
-- update public.rooms set creator_member_id = null
--   where creator_member_id in (select id from public.members where display_name in ('WRENIER CARILLO_', '?????????'));
-- delete from public.availability
--   where member_id in (select id from public.members where display_name in ('WRENIER CARILLO_', '?????????'));
-- delete from public.members where display_name in ('WRENIER CARILLO_', '?????????');
-- delete from public.rooms where id in (select id from spam_rooms);
-- commit;
