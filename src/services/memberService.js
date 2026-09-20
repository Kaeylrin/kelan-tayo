import { supabase } from '../utils/supabaseClient';

export async function joinRoom(roomId, displayName) {
  const response = await fetch('/api/joinRoom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, displayName })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to join room via secure API');
  }

  return response.json();
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

export async function deleteMember(roomId, memberId) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('room_id', roomId)
    .eq('id', memberId);

  if (error) throw error;
}
