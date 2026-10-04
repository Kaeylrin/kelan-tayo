import { supabase } from '../utils/supabaseClient';
import { postApi } from './apiClient';

/** Creates a room and its creator member. Returns { room, member }. */
export function createRoom({ name, creatorName, dateFrom, dateTo, preferredStart, preferredEnd, turnstileToken }) {
  return postApi('createRoom', {
    name,
    creatorName,
    dateFrom,
    dateTo,
    preferredStart: preferredStart || null,
    preferredEnd: preferredEnd || null,
    turnstileToken,
  });
}

export async function getRoomByCode(roomCode) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore not found errors gracefully
  return data;
}

export function confirmRoom(roomId, requestingMemberId, date, start, end) {
  return postApi('roomAction', { action: 'confirm', roomId, memberId: requestingMemberId, date, start, end });
}

export function unlockRoom(roomId, requestingMemberId) {
  return postApi('roomAction', { action: 'unlock', roomId, memberId: requestingMemberId });
}
