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

  // Anti-bot: Require a custom client header that simple python scripts won't have
  const clientHeader = req.headers['x-kelan-tayo-client'];
  if (clientHeader !== 'v1.3.3') {
    return res.status(403).json({ error: 'Unauthorized request origin' });
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
