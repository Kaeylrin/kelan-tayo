import { supabase } from '../utils/supabaseClient';

// ─── Regular Galas (the "room" equivalent) ────────────────────────────────────

/**
 * Creates a new Regular Gala owned by the given profile.
 * @param {string} profileId - UUID of the owning profile
 * @param {string} name - Display name of the gala
 * @param {string} startDate - ISO date string (YYYY-MM-DD)
 * @param {string|null} endDate - Optional ISO date string
 */
export async function createGala(profileId, name, startDate, endDate = null) {
  const { data, error } = await supabase
    .from('regular_galas')
    .insert({
      owner_id: profileId,
      name: name.trim(),
      start_date: startDate,
      end_date: endDate || null,
      status: 'active',
      is_paused: false,
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-join as a member
  await joinGala(data.id, profileId);

  return data;
}

/**
 * Lists all Regular Galas that the given profile is a member of.
 * @param {string} profileId
 */
export async function listMyGalas(profileId) {
  const { data, error } = await supabase
    .from('gala_members')
    .select('gala_id, regular_galas(*)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => row.regular_galas).filter(Boolean);
}

/**
 * Fetches a single Regular Gala by ID, including member count.
 * @param {string} galaId
 */
export async function getGala(galaId) {
  const { data, error } = await supabase
    .from('regular_galas')
    .select('*, gala_members(count)')
    .eq('id', galaId)
    .single();

  if (error) throw error;
  return data;
}

// ─── Membership ───────────────────────────────────────────────────────────────

/**
 * Adds a profile as a member of a Regular Gala.
 * Safe to call if already a member (upserts by conflict).
 * @param {string} galaId
 * @param {string} profileId
 */
export async function joinGala(galaId, profileId) {
  const { data, error } = await supabase
    .from('gala_members')
    .upsert(
      { gala_id: galaId, profile_id: profileId, is_paused: false },
      { onConflict: 'gala_id,profile_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Lists all members of a Regular Gala, including their profile details.
 * @param {string} galaId
 */
export async function listGalaMembers(galaId) {
  const { data, error } = await supabase
    .from('gala_members')
    .select('*, profiles(id, display_name, email)')
    .eq('gala_id', galaId);

  if (error) throw error;
  return data || [];
}

// ─── Weekly Patterns ──────────────────────────────────────────────────────────

/**
 * Upserts a member's weekly busy pattern for one weekday.
 * @param {string} galaId
 * @param {string} profileId
 * @param {number} weekday - 0=Mon … 6=Sun
 * @param {number[]} busyHours - array of 0-23 hour indices
 */
export async function saveWeeklyPattern(galaId, profileId, weekday, busyHours) {
  const { data, error } = await supabase
    .from('gala_patterns')
    .upsert(
      {
        gala_id: galaId,
        profile_id: profileId,
        weekday,
        busy_hours: busyHours,
      },
      { onConflict: 'gala_id,profile_id,weekday' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches all gala_patterns rows for a given gala (all members, all weekdays).
 * @param {string} galaId
 */
export async function getGalaPatterns(galaId) {
  const { data, error } = await supabase
    .from('gala_patterns')
    .select('*, profiles(id, display_name)')
    .eq('gala_id', galaId);

  if (error) throw error;
  return data || [];
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

/**
 * Owner confirms the recurring pattern for a Regular Gala.
 * Writes the confirmed days to the regular_galas row and marks status as confirmed.
 * @param {string} galaId
 * @param {string} ownerId - Must match the gala's owner_id
 * @param {object[]} confirmedDays - Array of { weekday, startHour, endHour }
 */
export async function confirmGalaPattern(galaId, ownerId, confirmedDays) {
  const { data, error } = await supabase
    .from('regular_galas')
    .update({
      confirmed_days: confirmedDays,
      status: 'confirmed',
    })
    .eq('id', galaId)
    .eq('owner_id', ownerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Pause Controls ───────────────────────────────────────────────────────────

/**
 * Owner toggles the entire gala's paused state.
 * @param {string} galaId
 * @param {string} ownerId
 * @param {boolean} isPaused
 */
export async function toggleGalaPause(galaId, ownerId, isPaused) {
  const { data, error } = await supabase
    .from('regular_galas')
    .update({ is_paused: isPaused })
    .eq('id', galaId)
    .eq('owner_id', ownerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * A member toggles their own attendance pause.
 * @param {string} galaId
 * @param {string} profileId
 * @param {boolean} isPaused
 */
export async function toggleMemberPause(galaId, profileId, isPaused) {
  const { data, error } = await supabase
    .from('gala_members')
    .update({ is_paused: isPaused })
    .eq('gala_id', galaId)
    .eq('profile_id', profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Exceptions ───────────────────────────────────────────────────────────────

/**
 * Adds a one-off exception (skip or add) for a specific date.
 * @param {string} galaId
 * @param {string} profileId - The member adding the exception
 * @param {string} date - ISO date string (YYYY-MM-DD)
 * @param {'Skip'|'Add'} type - Whether to skip or add a session on this date
 * @param {string} [note] - Optional note for context
 */
export async function addException(galaId, profileId, date, type, note = '') {
  const { data, error } = await supabase
    .from('gala_exceptions')
    .insert({
      gala_id: galaId,
      profile_id: profileId,
      date,
      type,
      note: note.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deletes an exception by its UUID.
 * @param {string} exceptionId
 */
export async function deleteException(exceptionId) {
  const { error } = await supabase
    .from('gala_exceptions')
    .delete()
    .eq('id', exceptionId);

  if (error) throw error;
}

/**
 * Fetches all exceptions for a gala, sorted by date ascending.
 * @param {string} galaId
 */
export async function getExceptions(galaId) {
  const { data, error } = await supabase
    .from('gala_exceptions')
    .select('*, profiles(id, display_name)')
    .eq('gala_id', galaId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
}
