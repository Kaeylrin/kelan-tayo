import {
  ApiError, LIMITS, withGuard, assertPostFromSite, getClientIp, verifyTurnstile,
  getAdminClient, rateLimit, cleanText, assertDate, optionalTime,
} from './_lib/guard.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode() {
  let rand = '';
  for (let i = 0; i < 3; i++) rand += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  return `KLTY-${rand}${Math.floor(100 + Math.random() * 900)}`;
}

// Creates a room and its creator member in one request.
export default withGuard(async (req, res) => {
  assertPostFromSite(req);
  const ip = getClientIp(req);
  await verifyTurnstile(req.body.turnstileToken, ip);

  const name = cleanText(req.body.name, LIMITS.roomName, 'Plan name');
  const creatorName = cleanText(req.body.creatorName, LIMITS.displayName, 'Your name');
  const dateFrom = assertDate(req.body.dateFrom, 'start date');
  const dateTo = assertDate(req.body.dateTo, 'end date');
  const preferredStart = optionalTime(req.body.preferredStart, 'preferred start');
  const preferredEnd = optionalTime(req.body.preferredEnd, 'preferred end');

  const from = Date.parse(`${dateFrom}T00:00:00Z`);
  const to = Date.parse(`${dateTo}T00:00:00Z`);
  const rangeDays = (to - from) / 86400000 + 1;
  if (rangeDays < 1) throw new ApiError(400, 'End date must be on or after the start date');
  if (rangeDays > LIMITS.maxRangeDays) throw new ApiError(400, `Plans can cover at most ${LIMITS.maxRangeDays} days`);
  if (from < Date.now() - 2 * 86400000) throw new ApiError(400, 'Start date cannot be in the past');

  const supabase = getAdminClient();
  await rateLimit(supabase, ip, 'create_room', 5, 60 * 60);
  await rateLimit(supabase, ip, 'create_room_daily', 15, 24 * 60 * 60);

  let room = null;
  for (let attempt = 0; attempt < 5 && !room; attempt++) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        room_code: generateRoomCode(),
        name,
        date_from: dateFrom,
        date_to: dateTo,
        preferred_start: preferredStart,
        preferred_end: preferredEnd,
        status: 'open',
      })
      .select()
      .single();
    if (error && error.code !== '23505') throw new ApiError(400, 'Could not create the plan');
    room = data;
  }
  if (!room) throw new ApiError(500, 'Could not create the plan');

  const { data: member, error: memberError } = await supabase
    .from('members')
    .insert({ room_id: room.id, display_name: creatorName })
    .select()
    .single();
  if (memberError) {
    await supabase.from('rooms').delete().eq('id', room.id);
    throw new ApiError(400, 'Could not create the plan');
  }

  const { data: updatedRoom, error: updateError } = await supabase
    .from('rooms')
    .update({ creator_member_id: member.id })
    .eq('id', room.id)
    .select()
    .single();
  if (updateError) throw new ApiError(500, 'Could not finish creating the plan');

  return res.status(200).json({ room: updatedRoom, member });
});
