import { supabase } from '../utils/supabaseClient';

const NEXT_PATH_KEY = 'kelan_gala_next';

/**
 * Sends a magic link to the given email address.
 * Redirects to /gala/callback after the user clicks the link. `next` is an
 * optional in-app path (e.g. an invite link) to open after signing in; it is
 * kept in localStorage so the redirect URL stays the one Supabase allows.
 */
export async function sendMagicLink(email, next) {
  try {
    if (isSafeNextPath(next)) localStorage.setItem(NEXT_PATH_KEY, next);
    else localStorage.removeItem(NEXT_PATH_KEY);
  } catch { /* storage unavailable */ }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/gala/callback` },
  });
  if (error) throw error;
}

/** Returns (and forgets) where to go after signing in. */
export function takeNextPath() {
  try {
    const next = localStorage.getItem(NEXT_PATH_KEY);
    localStorage.removeItem(NEXT_PATH_KEY);
    return isSafeNextPath(next) ? next : '/gala/dashboard';
  } catch {
    return '/gala/dashboard';
  }
}

/** Only same-site /gala paths are allowed as post-login destinations. */
export function isSafeNextPath(path) {
  return typeof path === 'string' && /^\/gala\/(dashboard|[0-9a-f-]{36})$/i.test(path);
}

/**
 * Returns the current Supabase auth session, or null if not signed in.
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Signs the user out of the current Supabase session.
 */
export async function signOut() {
  await supabase.auth.signOut();
}
