import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to securely join a room using the Service Role Key
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId, displayName } = req.body;

  if (!roomId || !displayName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify honeypot (if passed)
  if (req.body.website) {
    return res.status(200).json({ message: 'Success' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('members')
    .insert([{
      room_id: roomId,
      display_name: displayName
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}
