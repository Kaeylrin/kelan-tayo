import { supabase } from '../utils/supabaseClient';
import { postApi } from './apiClient';

/**
 * Saves a member's busy hours for the whole room in one request.
 * @param {Object<string, number[]>} slotsByDate - { 'YYYY-MM-DD': [busy hour indices] }
 */
export function saveAvailability(memberId, roomId, slotsByDate) {
  return postApi('saveAvailability', { roomId, memberId, slots: slotsByDate });
}

export async function getRoomAvailability(roomId) {
  const { data, error } = await supabase
    .from('availability')
    .select(`
      date,
      busy_hours,
      members (
        id,
        display_name
      )
    `)
    .eq('room_id', roomId);

  if (error) throw error;
  return data;
}
