import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// Shared security helpers for the /api routes. Files under api/_lib are not
// deployed as functions by Vercel (underscore prefix), only imported.

export const LIMITS = {
  roomName: 60,
  displayName: 40,
  maxRangeDays: 62,
  maxMembersPerRoom: 50,
};

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ApiError(500, 'Server configuration error');
  return createClient(url, key, { auth: { persistSession: false } });
}

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

// IPs are hashed before they are stored so we never keep raw addresses.
function hashIp(ip) {
  return createHash('sha256').update(`kelan-tayo:${ip}`).digest('hex');
}

const ALLOWED_HOSTS = [/^kelan-tayo\.vercel\.app$/, /^kelan-tayo-[\w-]+\.vercel\.app$/, /^localhost(:\d+)?$/, /^127\.0\.0\.1(:\d+)?$/];

/** Rejects non-POST requests and requests that did not come from our own pages. */
export function assertPostFromSite(req) {
  if (req.method !== 'POST') throw new ApiError(405, 'Method not allowed');
  const source = req.headers.origin || req.headers.referer;
  let host = '';
  try { host = new URL(source).host; } catch { /* missing or malformed */ }
  if (!host || (host !== req.headers.host && !ALLOWED_HOSTS.some((re) => re.test(host)))) {
    throw new ApiError(403, 'Unauthorized request origin');
  }
  if (!req.body || typeof req.body !== 'object') throw new ApiError(400, 'Invalid request body');
}

/** Verifies a Cloudflare Turnstile token. Fails closed if the secret is missing. */
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new ApiError(500, 'Server configuration error');
  if (typeof token !== 'string' || !token || token.length > 2048) {
    throw new ApiError(400, 'Security check missing. Please refresh and try again.');
  }
  const form = new URLSearchParams({ secret, response: token, remoteip: ip });
  const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const outcome = await cfRes.json().catch(() => ({}));
  if (!outcome.success) throw new ApiError(403, 'Security check failed. Please refresh and try again.');
}

/**
 * Per-IP rate limit backed by the api_rate_limits table.
 * Fails open if the table has not been created yet, so the site keeps working
 * (Turnstile and RLS still apply) until the migration has been run.
 */
export async function rateLimit(supabase, ip, action, max, windowSeconds) {
  const ipHash = hashIp(ip);
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await supabase
    .from('api_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .eq('action', action)
    .gte('created_at', since);

  if (error) {
    console.warn(`rateLimit(${action}) skipped:`, error.message);
    return;
  }
  if (count >= max) throw new ApiError(429, 'Too many requests. Please wait a bit and try again.');
  await Promise.all([
    supabase.from('api_rate_limits').insert({ ip_hash: ipHash, action }),
    // Entries are only needed for the longest window (24h); prune older ones.
    supabase.from('api_rate_limits').delete().lt('created_at', new Date(Date.now() - 86400000).toISOString()),
  ]);
}

/** Trims, strips control characters and collapses whitespace. Throws if empty or too long. */
export function cleanText(value, maxLength, label) {
  if (typeof value !== 'string') throw new ApiError(400, `${label} is required`);
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/\s+/g, ' ').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF]/g, '').trim();
  if (!cleaned) throw new ApiError(400, `${label} is required`);
  if (cleaned.length > maxLength) throw new ApiError(400, `${label} must be ${maxLength} characters or less`);
  return cleaned;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function assertUuid(value, label) {
  if (typeof value !== 'string' || !UUID_RE.test(value)) throw new ApiError(400, `Invalid ${label}`);
  return value;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export function assertDate(value, label) {
  if (typeof value !== 'string' || !DATE_RE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return value;
}

const TIME_RE = /^([01]\d|2[0-4]):[0-5]\d$/;
export function optionalTime(value, label) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !TIME_RE.test(value)) throw new ApiError(400, `Invalid ${label}`);
  return value;
}

/** Ensures the member exists and belongs to the room. Returns { room, member }. */
export async function loadRoomMember(supabase, roomId, memberId) {
  const { data: room, error: roomError } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
  if (roomError) throw new ApiError(500, 'Could not load room');
  if (!room) throw new ApiError(404, 'Room not found');

  const { data: member, error: memberError } = await supabase
    .from('members').select('id, room_id, display_name').eq('id', memberId).eq('room_id', roomId).maybeSingle();
  if (memberError) throw new ApiError(500, 'Could not load member');
  if (!member) throw new ApiError(403, 'You are not a member of this room');
  return { room, member };
}

/** Wraps a handler so ApiErrors become JSON responses and everything else a generic 500. */
export function withGuard(handler) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
      // Honeypot: real users never fill the hidden "website" field.
      if (req.body && typeof req.body === 'object' && req.body.website) {
        return res.status(200).json({ ok: true });
      }
      return await handler(req, res);
    } catch (err) {
      if (err instanceof ApiError) return res.status(err.status).json({ error: err.message });
      console.error(err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  };
}
