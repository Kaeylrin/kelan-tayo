/**
 * POSTs JSON to one of our /api routes. All database writes go through these
 * routes; the browser's Supabase client is read-only.
 */
export async function postApi(path, body, headers = {}) {
  const response = await fetch(`/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed. Please try again.');
    error.status = response.status;
    throw error;
  }
  return data;
}
