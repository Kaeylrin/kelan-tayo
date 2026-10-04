import { supabase } from '../utils/supabaseClient';
import { postApi } from './apiClient';

export function joinRoom(roomId, displayName, turnstileToken) {
  return postApi('joinRoom', { roomId, displayName, turnstileToken });
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

export function deleteMember(roomId, memberId) {
  return postApi('roomAction', { action: 'leave', roomId, memberId });
}
