import {
  ApiError, LIMITS, withGuard, assertPostFromSite, getClientIp, getAdminClient,
  rateLimit, cleanText, assertUuid, assertDate,
} from './_lib/guard.js';

// Every Regular Gala read and write. The caller must send the Supabase access
// token from their magic-link session as "Authorization: Bearer <token>".
// Body: { action, ...params }. The gala tables are not readable or writable
// with the public key at all, so this route is the only way in.

const GALA_LIMITS = {
  galasPerOwner: 20,
  membersPerGala: 50,
  exceptionsPerGala: 300,
  noteLength: 120,
  maxSpanDays: 3 * 366,
};

const CHECK_VIOLATION = '23514';

async function getUser(supabase, req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token || token.length > 4096) throw new ApiError(401, 'Please save your spot again to continue.');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id || !data.user.email) throw new ApiError(401, 'Your saved spot expired on this device. Please save your spot again.');
  return data.user;
}

/** Finds or creates the caller's profile row. */
async function ensureProfile(supabase, user) {
  const { data: existing, error } = await supabase
    .from('profiles').select('id, email, display_name').eq('id', user.id).maybeSingle();
  if (error) throw new ApiError(500, 'Could not load your profile');
  if (existing) return existing;

  const fallbackName = user.email.split('@')[0].replace(/[^\p{L}\p{N} ._-]/gu, '').slice(0, LIMITS.displayName) || 'Member';
  const { data, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id, email: user.email, display_name: fallbackName })
    .select('id, email, display_name')
    .single();
  if (insertError) throw new ApiError(500, 'Could not create your profile');
  return data;
}

async function loadGala(supabase, galaId) {
  const { data, error } = await supabase.from('regular_galas').select('*').eq('id', galaId).maybeSingle();
  if (error) throw new ApiError(500, 'Could not load this Regular Gala');
  if (!data) throw new ApiError(404, 'This Regular Gala does not exist or was deleted');
  return data;
}

async function getMembership(supabase, galaId, profileId) {
  const { data, error } = await supabase
    .from('gala_members').select('id, is_paused').eq('gala_id', galaId).eq('profile_id', profileId).maybeSingle();
  if (error) throw new ApiError(500, 'Could not check membership');
  return data;
}

async function requireMember(supabase, galaId, profileId) {
  const gala = await loadGala(supabase, galaId);
  const membership = await getMembership(supabase, galaId, profileId);
  if (!membership) throw new ApiError(403, 'Join this Regular Gala first');
  return { gala, membership };
}

async function requireOwner(supabase, galaId, profileId) {
  const gala = await loadGala(supabase, galaId);
  if (gala.created_by !== profileId) throw new ApiError(403, 'Only the gala owner can do that');
  return gala;
}

// Older databases may still use capitalised values in their check constraints;
// retry once with the legacy value so the app works before the migration runs.
async function withLegacyValue(run, value, legacyValue) {
  const result = await run(value);
  if (result.error?.code === CHECK_VIOLATION && legacyValue) return run(legacyValue);
  return result;
}

function toPublicGala(gala) {
  return {
    id: gala.id,
    name: gala.name,
    created_by: gala.created_by,
    start_date: gala.start_date,
    end_date: gala.end_date,
    status: gala.status === 'confirmed' ? 'confirmed' : 'pending',
    is_paused: Boolean(gala.is_paused),
    confirmed_days: Array.isArray(gala.confirmed_days) ? gala.confirmed_days : [],
    confirmed_at: gala.confirmed_at || null,
  };
}

function assertBoolean(value, label) {
  if (typeof value !== 'boolean') throw new ApiError(400, `Invalid ${label}`);
  return value;
}

function assertHour(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > 23) throw new ApiError(400, `Invalid ${label}`);
  return value;
}

function daysBetween(from, to) {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

const actions = {
  async me({ profile }) {
    return { profile };
  },

  async updateProfile({ supabase, profile, body }) {
    const displayName = cleanText(body.displayName, LIMITS.displayName, 'Display name');
    const { data, error } = await supabase
      .from('profiles').update({ display_name: displayName }).eq('id', profile.id)
      .select('id, email, display_name').single();
    if (error) throw new ApiError(500, 'Could not update your name');
    return { profile: data };
  },

  async list({ supabase, profile }) {
    const { data: memberships, error } = await supabase
      .from('gala_members').select('gala_id, is_paused, joined_at').eq('profile_id', profile.id);
    if (error) throw new ApiError(500, 'Could not load your Regular Galas');
    const ids = memberships.map((m) => m.gala_id);
    if (ids.length === 0) return { profile, galas: [] };

    const [{ data: galas, error: galaError }, { data: allMembers, error: countError }] = await Promise.all([
      supabase.from('regular_galas').select('*').in('id', ids),
      supabase.from('gala_members').select('gala_id').in('gala_id', ids),
    ]);
    if (galaError || countError) throw new ApiError(500, 'Could not load your Regular Galas');

    const counts = new Map();
    allMembers.forEach((m) => counts.set(m.gala_id, (counts.get(m.gala_id) || 0) + 1));
    const joinedAt = new Map(memberships.map((m) => [m.gala_id, m.joined_at]));

    const result = galas
      .map((g) => ({
        ...toPublicGala(g),
        member_count: counts.get(g.id) || 0,
        is_owner: g.created_by === profile.id,
        joined_at: joinedAt.get(g.id) || null,
      }))
      .sort((a, b) => String(b.joined_at).localeCompare(String(a.joined_at)));
    return { profile, galas: result };
  },

  async load({ supabase, profile, body }) {
    const galaId = assertUuid(body.galaId, 'gala');
    const gala = await loadGala(supabase, galaId);

    const { data: memberRows, error: memberError } = await supabase
      .from('gala_members').select('profile_id, is_paused, joined_at, profiles(display_name)').eq('gala_id', galaId);
    if (memberError) throw new ApiError(500, 'Could not load members');

    const members = memberRows
      .map((m) => ({
        profile_id: m.profile_id,
        display_name: m.profiles?.display_name || 'Member',
        is_paused: Boolean(m.is_paused),
        joined_at: m.joined_at,
        is_owner: m.profile_id === gala.created_by,
      }))
      .sort((a, b) => Number(b.is_owner) - Number(a.is_owner) || String(a.joined_at).localeCompare(String(b.joined_at)));

    const isMember = members.some((m) => m.profile_id === profile.id);
    const owner = members.find((m) => m.is_owner);
    const base = {
      profile,
      gala: toPublicGala(gala),
      isMember,
      isOwner: gala.created_by === profile.id,
      ownerName: owner?.display_name || null,
      memberCount: members.length,
    };
    // Non-members only see enough to decide whether to join.
    if (!isMember) return base;

    const [{ data: patterns, error: patternError }, { data: exceptions, error: exceptionError }] = await Promise.all([
      supabase.from('gala_patterns').select('profile_id, weekday, busy_hours').eq('gala_id', galaId),
      supabase.from('gala_exceptions').select('id, profile_id, date, type, note').eq('gala_id', galaId).order('date', { ascending: true }),
    ]);
    if (patternError || exceptionError) throw new ApiError(500, 'Could not load schedules');

    const names = new Map(members.map((m) => [m.profile_id, m.display_name]));
    return {
      ...base,
      members,
      patterns: patterns.map((p) => ({
        profile_id: p.profile_id,
        weekday: p.weekday,
        busy_hours: Array.isArray(p.busy_hours) ? p.busy_hours : [],
      })),
      exceptions: exceptions.map((e) => ({
        id: e.id,
        profile_id: e.profile_id,
        display_name: e.profile_id ? names.get(e.profile_id) || 'Former member' : null,
        date: e.date,
        type: String(e.type).toLowerCase() === 'add' ? 'add' : 'skip',
        note: e.note || null,
      })),
    };
  },

  async create({ supabase, profile, body, ip }) {
    const name = cleanText(body.name, LIMITS.roomName, 'Gala name');
    const startDate = assertDate(body.startDate, 'start date');
    const endDate = body.endDate ? assertDate(body.endDate, 'end date') : null;
    if (endDate && endDate < startDate) throw new ApiError(400, 'End date must be on or after the start date');
    if (endDate && daysBetween(startDate, endDate) > GALA_LIMITS.maxSpanDays) throw new ApiError(400, 'A Regular Gala can run for at most 3 years');

    await rateLimit(supabase, ip, 'gala_create', 10, 60 * 60);
    const { count, error: countError } = await supabase
      .from('regular_galas').select('id', { count: 'exact', head: true }).eq('created_by', profile.id);
    if (countError) throw new ApiError(500, 'Could not create the Regular Gala');
    if (count >= GALA_LIMITS.galasPerOwner) throw new ApiError(409, `You can own at most ${GALA_LIMITS.galasPerOwner} Regular Galas`);

    const { data: gala, error } = await withLegacyValue(
      (status) => supabase.from('regular_galas').insert({
        name, created_by: profile.id, start_date: startDate, end_date: endDate, status, is_paused: false,
      }).select().single(),
      'pending', 'active',
    );
    if (error) throw new ApiError(400, 'Could not create the Regular Gala');

    const { error: memberError } = await supabase
      .from('gala_members').insert({ gala_id: gala.id, profile_id: profile.id, is_paused: false });
    if (memberError) {
      await supabase.from('regular_galas').delete().eq('id', gala.id);
      throw new ApiError(500, 'Could not create the Regular Gala');
    }
    return { gala: toPublicGala(gala) };
  },

  async join({ supabase, profile, body, ip }) {
    const galaId = assertUuid(body.galaId, 'gala');
    await rateLimit(supabase, ip, 'gala_join', 30, 60 * 60);
    await loadGala(supabase, galaId);
    if (await getMembership(supabase, galaId, profile.id)) return { ok: true };

    const { count } = await supabase
      .from('gala_members').select('id', { count: 'exact', head: true }).eq('gala_id', galaId);
    if (count >= GALA_LIMITS.membersPerGala) throw new ApiError(409, 'This Regular Gala is full');

    const { error } = await supabase.from('gala_members').insert({ gala_id: galaId, profile_id: profile.id, is_paused: false });
    if (error) throw new ApiError(400, 'Could not join this Regular Gala');
    return { ok: true };
  },

  async leave({ supabase, profile, body }) {
    const galaId = assertUuid(body.galaId, 'gala');
    const { gala } = await requireMember(supabase, galaId, profile.id);
    if (gala.created_by === profile.id) throw new ApiError(409, 'Owners cannot leave their own gala. Delete it instead.');
    const results = await Promise.all([
      supabase.from('gala_patterns').delete().eq('gala_id', galaId).eq('profile_id', profile.id),
      supabase.from('gala_exceptions').delete().eq('gala_id', galaId).eq('profile_id', profile.id),
    ]);
    if (results.some((r) => r.error)) throw new ApiError(500, 'Could not leave this Regular Gala');
    const { error } = await supabase.from('gala_members').delete().eq('gala_id', galaId).eq('profile_id', profile.id);
    if (error) throw new ApiError(500, 'Could not leave this Regular Gala');
    return { ok: true };
  },

  async remove({ supabase, profile, body }) {
    const galaId = assertUuid(body.galaId, 'gala');
    await requireOwner(supabase, galaId, profile.id);
    for (const table of ['gala_exceptions', 'gala_patterns', 'gala_members']) {
      const { error } = await supabase.from(table).delete().eq('gala_id', galaId);
      if (error) throw new ApiError(500, 'Could not delete this Regular Gala');
    }
    const { error } = await supabase.from('regular_galas').delete().eq('id', galaId);
    if (error) throw new ApiError(500, 'Could not delete this Regular Gala');
    return { ok: true };
  },

  async savePatterns({ supabase, profile, body, ip }) {
    const galaId = assertUuid(body.galaId, 'gala');
    const input = body.patterns;
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError(400, 'Invalid schedule');
    const rows = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const hours = input[weekday] ?? input[String(weekday)] ?? [];
      if (!Array.isArray(hours) || hours.length > 24) throw new ApiError(400, 'Invalid schedule');
      hours.forEach((h) => assertHour(h, 'hour'));
      rows.push({ weekday, busy_hours: [...new Set(hours)].sort((a, b) => a - b) });
    }

    await rateLimit(supabase, ip, 'gala_save', 60, 60 * 60);
    await requireMember(supabase, galaId, profile.id);

    const { data: existing, error: fetchError } = await supabase
      .from('gala_patterns').select('id, weekday').eq('gala_id', galaId).eq('profile_id', profile.id);
    if (fetchError) throw new ApiError(500, 'Could not save your schedule');

    const idByWeekday = new Map(existing.map((r) => [r.weekday, r.id]));
    const now = new Date().toISOString();
    const toInsert = rows.filter((r) => !idByWeekday.has(r.weekday))
      .map((r) => ({ gala_id: galaId, profile_id: profile.id, weekday: r.weekday, busy_hours: r.busy_hours }));
    const results = await Promise.all([
      toInsert.length ? supabase.from('gala_patterns').insert(toInsert) : { error: null },
      ...rows.filter((r) => idByWeekday.has(r.weekday)).map((r) => supabase.from('gala_patterns')
        .update({ busy_hours: r.busy_hours, updated_at: now }).eq('id', idByWeekday.get(r.weekday))),
    ]);
    if (results.some((r) => r.error)) throw new ApiError(500, 'Could not save your schedule');
    return { ok: true };
  },

  async confirm({ supabase, profile, body }) {
    const galaId = assertUuid(body.galaId, 'gala');
    const days = body.days;
    if (!Array.isArray(days) || days.length === 0 || days.length > 7) throw new ApiError(400, 'Pick at least one day');
    const seen = new Set();
    const confirmedDays = days.map((d) => {
      const weekday = Number.isInteger(d?.weekday) && d.weekday >= 0 && d.weekday <= 6 ? d.weekday : null;
      if (weekday === null || seen.has(weekday)) throw new ApiError(400, 'Invalid day');
      seen.add(weekday);
      const startHour = assertHour(d.startHour, 'start time');
      const endHour = assertHour(d.endHour, 'end time');
      if (endHour < startHour) throw new ApiError(400, 'End time must be after the start time');
      return { weekday, startHour, endHour };
    }).sort((a, b) => a.weekday - b.weekday);

    await requireOwner(supabase, galaId, profile.id);
    const { data, error } = await supabase.from('regular_galas')
      .update({ status: 'confirmed', confirmed_days: confirmedDays, confirmed_at: new Date().toISOString() })
      .eq('id', galaId).select().single();
    if (error) throw new ApiError(500, 'Could not confirm the schedule');
    return { gala: toPublicGala(data) };
  },

  async unconfirm({ supabase, profile, body }) {
    const galaId = assertUuid(body.galaId, 'gala');
    await requireOwner(supabase, galaId, profile.id);
    const { data, error } = await withLegacyValue(
      (status) => supabase.from('regular_galas')
        .update({ status, confirmed_days: null, confirmed_at: null }).eq('id', galaId).select().single(),
      'pending', 'active',
    );
    if (error) throw new ApiError(500, 'Could not reopen the schedule');
    return { gala: toPublicGala(data) };
  },

  async pauseGala({ supabase, profile, body }) {
    const galaId = assertUuid(body.galaId, 'gala');
    const paused = assertBoolean(body.paused, 'pause value');
    await requireOwner(supabase, galaId, profile.id);
    const { data, error } = await supabase.from('regular_galas').update({ is_paused: paused }).eq('id', galaId).select().single();
    if (error) throw new ApiError(500, 'Could not update the gala');
    return { gala: toPublicGala(data) };
  },

  async pauseMember({ supabase, profile, body }) {
    const galaId = assertUuid(body.galaId, 'gala');
    const paused = assertBoolean(body.paused, 'pause value');
    await requireMember(supabase, galaId, profile.id);
    const { error } = await supabase.from('gala_members').update({ is_paused: paused }).eq('gala_id', galaId).eq('profile_id', profile.id);
    if (error) throw new ApiError(500, 'Could not update your status');
    return { ok: true };
  },

  async addException({ supabase, profile, body, ip }) {
    const galaId = assertUuid(body.galaId, 'gala');
    const date = assertDate(body.date, 'date');
    if (body.type !== 'skip' && body.type !== 'add') throw new ApiError(400, 'Invalid exception type');
    if (body.scope !== 'gala' && body.scope !== 'me') throw new ApiError(400, 'Invalid exception scope');
    const note = typeof body.note === 'string' && body.note.trim() ? cleanText(body.note, GALA_LIMITS.noteLength, 'Note') : null;

    await rateLimit(supabase, ip, 'gala_exception', 60, 60 * 60);
    const { gala } = await requireMember(supabase, galaId, profile.id);
    if (body.scope === 'gala' && gala.created_by !== profile.id) throw new ApiError(403, 'Only the gala owner can add gala-wide exceptions');
    if (date < gala.start_date || (gala.end_date && date > gala.end_date)) throw new ApiError(400, 'That date is outside this gala');

    const { count } = await supabase
      .from('gala_exceptions').select('id', { count: 'exact', head: true }).eq('gala_id', galaId);
    if (count >= GALA_LIMITS.exceptionsPerGala) throw new ApiError(409, 'This gala has too many exceptions. Remove some old ones first.');

    const profileId = body.scope === 'gala' ? null : profile.id;
    const legacyType = body.type === 'skip' ? 'Skip' : 'Add';
    const { error } = await withLegacyValue(
      (type) => supabase.from('gala_exceptions').insert({ gala_id: galaId, profile_id: profileId, date, type, note }),
      body.type, legacyType,
    );
    if (error) throw new ApiError(400, 'Could not add the exception');
    return { ok: true };
  },

  async deleteException({ supabase, profile, body }) {
    const exceptionId = assertUuid(body.exceptionId, 'exception');
    const { data: exception, error } = await supabase
      .from('gala_exceptions').select('id, gala_id, profile_id').eq('id', exceptionId).maybeSingle();
    if (error) throw new ApiError(500, 'Could not remove the exception');
    if (!exception) return { ok: true };
    const gala = await loadGala(supabase, exception.gala_id);
    if (gala.created_by !== profile.id && exception.profile_id !== profile.id) {
      throw new ApiError(403, 'You can only remove your own exceptions');
    }
    const { error: deleteError } = await supabase.from('gala_exceptions').delete().eq('id', exceptionId);
    if (deleteError) throw new ApiError(500, 'Could not remove the exception');
    return { ok: true };
  },
};

export default withGuard(async (req, res) => {
  assertPostFromSite(req);
  const action = req.body.action;
  if (typeof action !== 'string' || !Object.hasOwn(actions, action)) throw new ApiError(400, 'Unknown action');

  const ip = getClientIp(req);
  const supabase = getAdminClient();
  await rateLimit(supabase, ip, 'gala_request', 600, 60 * 60);
  const user = await getUser(supabase, req);
  const profile = await ensureProfile(supabase, user);

  const result = await actions[action]({ supabase, profile, body: req.body, ip });
  return res.status(200).json(result);
});
