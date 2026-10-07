import { supabase } from '../utils/supabaseClient';
import { postApi } from './apiClient';

// Every Regular Gala read and write goes through /api/gala, signed with the
// visitor's magic-link session. The gala tables are closed to the public key.

async function callGala(action, params = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    const error = new Error('Please save your spot again to continue.');
    error.status = 401;
    throw error;
  }
  return postApi('gala', { action, ...params }, { Authorization: `Bearer ${token}` });
}

/** Returns { profile } for the signed-in visitor, creating the profile on first use. */
export const getMe = () => callGala('me');

/** Returns { profile }. */
export const updateDisplayName = (displayName) => callGala('updateProfile', { displayName });

/** Returns { profile, galas } — every gala the visitor belongs to. */
export const listMyGalas = () => callGala('list');

/**
 * Returns { profile, gala, isMember, isOwner, ownerName, memberCount } and,
 * for members, also { members, patterns, exceptions }.
 */
export const loadGala = (galaId) => callGala('load', { galaId });

/** Returns { gala }. endDate is optional. */
export const createGala = (name, startDate, endDate) =>
  callGala('create', { name, startDate, endDate: endDate || null });

export const joinGala = (galaId) => callGala('join', { galaId });
export const leaveGala = (galaId) => callGala('leave', { galaId });
export const deleteGala = (galaId) => callGala('remove', { galaId });

/**
 * Saves the visitor's busy hours for all seven weekdays in one request.
 * @param {Object<number, number[]>} patterns - { 0: [busy hours], ..., 6: [...] }, 0 = Monday
 */
export const saveWeeklyPatterns = (galaId, patterns) => callGala('savePatterns', { galaId, patterns });

/** Owner only. days: [{ weekday, startHour, endHour }] with endHour inclusive. Returns { gala }. */
export const confirmGalaPattern = (galaId, days) => callGala('confirm', { galaId, days });

/** Owner only. Returns { gala }. */
export const unconfirmGalaPattern = (galaId) => callGala('unconfirm', { galaId });

/** Owner only. Returns { gala }. */
export const setGalaPaused = (galaId, paused) => callGala('pauseGala', { galaId, paused });

export const setMemberPaused = (galaId, paused) => callGala('pauseMember', { galaId, paused });

/**
 * @param {'skip'|'add'} type
 * @param {'gala'|'me'} scope - gala-wide (owner only) or just the visitor
 */
export const addException = (galaId, { date, type, scope, note }) =>
  callGala('addException', { galaId, date, type, scope, note: note || '' });

export const deleteException = (exceptionId) => callGala('deleteException', { exceptionId });
