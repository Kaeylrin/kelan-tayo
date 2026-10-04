import {
  ApiError, LIMITS, withGuard, assertPostFromSite, getClientIp, verifyTurnstile,
  getAdminClient, rateLimit, cleanText, assertUuid,
} from './_lib/guard.js';

// Adds a new member to an existing room.
export default withGuard(async (req, res) => {
  assertPostFromSite(req);
  const ip = getClientIp(req);
  await verifyTurnstile(req.body.turnstileToken, ip);

  const roomId = assertUuid(req.body.roomId, 'room');
  const displayName = cleanText(req.body.displayName, LIMITS.displayName, 'Display name');

  const supabase = getAdminClient();
  await rateLimit(supabase, ip, 'join_room', 20, 60 * 60);

  const { data: room } = await supabase.from('rooms').select('id, status').eq('id', roomId).maybeSingle();
  if (!room) throw new ApiError(404, 'Room not found');
  if (room.status === 'confirmed') throw new ApiError(409, 'This plan is already locked in');

  const { count } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('room_id', roomId);
  if (count >= LIMITS.maxMembersPerRoom) throw new ApiError(409, 'This room is full');

  const { data, error } = await supabase
    .from('members')
    .insert({ room_id: roomId, display_name: displayName })
    .select()
    .single();
  if (error) throw new ApiError(400, 'Could not join the room');

  return res.status(200).json(data);
});
