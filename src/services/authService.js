import { supabase } from '../utils/supabaseClient';

/**
 * Sends a magic link to the given email address.
 * Redirects to /gala/callback after the user clicks the link.
 */
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/gala/callback' },
  });
  if (error) throw error;
}

/**
 * Returns the current Supabase auth session, or null if not signed in.
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Finds or creates a profile row for the authenticated user.
 * Uses the email prefix as the default display name.
 */
export async function getOrCreateProfile(session) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: session.user.id,
      email: session.user.email,
      display_name: session.user.email.split('@')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Signs the user out of the current Supabase session.
 */
export async function signOut() {
  await supabase.auth.signOut();
}
