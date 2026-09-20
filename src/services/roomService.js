import { supabase } from '../utils/supabaseClient';
import { generateRoomCode } from '../utils/storage';

export async function createRoom(name, dateFrom, dateTo, preferredStart, preferredEnd) {
  const roomCode = generateRoomCode();
  
  const response = await fetch('/api/createRoom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode,
      name,
      dateFrom,
      dateTo,
      preferredStart: preferredStart || null,
      preferredEnd: preferredEnd || null
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create room via secure API');
  }

  return response.json();
}

export async function updateRoomCreator(roomId, memberId) {
  const { data, error } = await supabase
    .from('rooms')
    .update({ creator_member_id: memberId })
    .eq('id', roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
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

export async function confirmRoom(roomId, requestingMemberId, date, start, end) {
  const { data, error } = await supabase
    .from('rooms')
    .update({
      status: 'confirmed',
      confirmed_date: date,
      confirmed_start: start,
      confirmed_end: end,
      confirmed_at: new Date().toISOString()
    })
    .eq('id', roomId)
    .eq('creator_member_id', requestingMemberId) // Extra security check
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unlockRoom(roomId, requestingMemberId) {
  const { data, error } = await supabase
    .from('rooms')
    .update({
      status: 'open',
      confirmed_date: null,
      confirmed_start: null,
      confirmed_end: null,
      confirmed_at: null
    })
    .eq('id', roomId)
    .eq('creator_member_id', requestingMemberId) // Extra security check
    .select()
    .single();

  if (error) throw error;
  return data;
}
