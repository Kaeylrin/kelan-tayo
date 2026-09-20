import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to securely create a room using the Service Role Key
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic in-memory rate limiting (per-instance)
  // Not perfect for serverless but adds a small layer of friction if spamming single instances
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  // Here you can integrate Upstash Redis for true rate limiting
  // e.g. await ratelimit.limit(clientIp)
  
  const { name, dateFrom, dateTo, preferredStart, preferredEnd, roomCode } = req.body;

  if (!name || !dateFrom || !dateTo || !roomCode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify honeypot (if somehow they bypassed frontend)
  if (req.body.website) {
    return res.status(200).json({ message: 'Success' }); // Silent rejection
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be added to Vercel Env Vars

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('rooms')
    .insert([{
      room_code: roomCode,
      name: name,
      date_from: dateFrom,
      date_to: dateTo,
      preferred_start: preferredStart || null,
      preferred_end: preferredEnd || null,
      status: 'open'
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
}
