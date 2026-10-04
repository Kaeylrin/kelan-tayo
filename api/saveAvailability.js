import {
  ApiError, withGuard, assertPostFromSite, getClientIp, getAdminClient,
  rateLimit, assertUuid, assertDate, loadRoomMember,
} from './_lib/guard.js';

// Saves a member's busy hours for every date in the room in one request.
// Body: { roomId, memberId, slots: { 'YYYY-MM-DD': [0..23] } }
export default withGuard(async (req, res) => {
  assertPostFromSite(req);
  const ip = getClientIp(req);
  const roomId = assertUuid(req.body.roomId, 'room');
  const memberId = assertUuid(req.body.memberId, 'member');
  const slots = req.body.slots;
  if (!slots || typeof slots !== 'object' || Array.isArray(slots)) throw new ApiError(400, 'Invalid schedule');

  const supabase = getAdminClient();
  await rateLimit(supabase, ip, 'save_availability', 60, 60 * 60);

  const { room } = await loadRoomMember(supabase, roomId, memberId);
  if (room.status === 'confirmed') throw new ApiError(409, 'This plan is already locked in');

  const rows = Object.entries(slots).map(([date, hours]) => {
    assertDate(date, 'date');
    if (date < room.date_from || date > room.date_to) throw new ApiError(400, 'Date is outside this plan');
    if (!Array.isArray(hours) || hours.some((h) => !Number.isInteger(h) || h < 0 || h > 23)) {
      throw new ApiError(400, 'Invalid hours');
    }
    return { date, busy_hours: [...new Set(hours)].sort((a, b) => a - b) };
  });
  if (rows.length > 100) throw new ApiError(400, 'Invalid schedule');

  const { data: existing, error: fetchError } = await supabase
    .from('availability')
    .select('id, date')
    .eq('member_id', memberId)
    .eq('room_id', roomId);
  if (fetchError) throw new ApiError(500, 'Could not save schedule');

  const idByDate = new Map(existing.map((r) => [r.date, r.id]));
  const now = new Date().toISOString();
  const toInsert = rows.filter((r) => !idByDate.has(r.date))
    .map((r) => ({ member_id: memberId, room_id: roomId, date: r.date, busy_hours: r.busy_hours }));
  const toUpdate = rows.filter((r) => idByDate.has(r.date));

  const results = await Promise.all([
    toInsert.length ? supabase.from('availability').insert(toInsert) : { error: null },
    ...toUpdate.map((r) => supabase.from('availability')
      .update({ busy_hours: r.busy_hours, updated_at: now })
      .eq('id', idByDate.get(r.date))),
  ]);
  if (results.some((r) => r.error)) throw new ApiError(500, 'Could not save schedule');

  return res.status(200).json({ ok: true });
});
