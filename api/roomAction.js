import {
  ApiError, withGuard, assertPostFromSite, getClientIp, getAdminClient,
  rateLimit, assertUuid, assertDate, loadRoomMember,
} from './_lib/guard.js';

// Room changes made by an existing member.
// Body: { action: 'confirm' | 'unlock' | 'leave', roomId, memberId, date?, start?, end? }
export default withGuard(async (req, res) => {
  assertPostFromSite(req);
  const ip = getClientIp(req);
  const { action } = req.body;
  const roomId = assertUuid(req.body.roomId, 'room');
  const memberId = assertUuid(req.body.memberId, 'member');

  const supabase = getAdminClient();
  await rateLimit(supabase, ip, 'room_action', 30, 60 * 60);
  const { room } = await loadRoomMember(supabase, roomId, memberId);

  if (action === 'leave') {
    const { error } = await supabase.from('members').delete().eq('id', memberId).eq('room_id', roomId);
    if (error) throw new ApiError(500, 'Could not leave the plan');
    return res.status(200).json({ ok: true });
  }

  if (room.creator_member_id !== memberId) throw new ApiError(403, 'Only the plan creator can do that');

  let changes;
  if (action === 'confirm') {
    const date = assertDate(req.body.date, 'date');
    const { start, end } = req.body;
    if (date < room.date_from || date > room.date_to) throw new ApiError(400, 'Date is outside this plan');
    const timeRe = /^\d{1,2}:\d{2}(:\d{2})?$/;
    if (!timeRe.test(start ?? '') || !timeRe.test(end ?? '')) {
      throw new ApiError(400, 'Invalid time range');
    }
    changes = { status: 'confirmed', confirmed_date: date, confirmed_start: start, confirmed_end: end, confirmed_at: new Date().toISOString() };
  } else if (action === 'unlock') {
    changes = { status: 'open', confirmed_date: null, confirmed_start: null, confirmed_end: null, confirmed_at: null };
  } else {
    throw new ApiError(400, 'Unknown action');
  }

  const { data, error } = await supabase.from('rooms').update(changes).eq('id', roomId).select().single();
  if (error) throw new ApiError(500, 'Could not update the plan');
  return res.status(200).json(data);
});
