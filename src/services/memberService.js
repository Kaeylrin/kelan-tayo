import { supabase } from '../utils/supabaseClient';

export async function joinRoom(roomId, displayName) {
  const { data, error } = await supabase
    .from('members')
    .insert([{
      room_id: roomId,
      display_name: displayName
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMemberByName(roomId, displayName) {
  // A helper function to check if the user is already in the room
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('room_id', roomId)
    .ilike('display_name', displayName)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listMembers(roomId) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data;
}
