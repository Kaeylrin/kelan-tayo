import { supabase } from '../utils/supabaseClient';

export async function saveAvailability(memberId, roomId, date, busyHours) {
  // Try to find if an entry already exists for this member on this date
  const { data: existing, error: fetchError } = await supabase
    .from('availability')
    .select('id')
    .eq('member_id', memberId)
    .eq('date', date)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('availability')
      .update({
        busy_hours: busyHours,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('availability')
      .insert([{
        member_id: memberId,
        room_id: roomId,
        date: date,
        busy_hours: busyHours
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
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

export async function clearAllRoomAvailability(roomId) {
  // A helper in case we ever need to reset a room's availability
  const { data, error } = await supabase
    .from('availability')
    .delete()
    .eq('room_id', roomId);

  if (error) throw error;
  return data;
}
