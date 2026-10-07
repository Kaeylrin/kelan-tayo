// Loose email shape check: something@something.something, no spaces.
// Supabase does the real validation when it sends the link.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);
}
