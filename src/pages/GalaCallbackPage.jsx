import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, takeNextPath } from '../services/authService.js';
import { getMe } from '../services/galaService.js';

function readAuthError() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);
  return hash.get('error_description') || query.get('error_description');
}

/**
 * Route: /gala/callback
 * Supabase redirects here after the magic link is clicked. supabase-js reads
 * the session from the URL while it initialises, and getSession() waits for that.
 */
export function GalaCallbackPage() {
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('Verifying your link…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const fail = (message) => {
      setFailed(true);
      setStatusText(message);
      timer = setTimeout(() => navigate('/gala', { replace: true }), 3500);
    };

    (async () => {
      const authError = readAuthError();
      const session = await getSession().catch(() => null);
      if (cancelled) return;
      if (!session) {
        fail(authError ? `${authError}. Please request a new link.` : 'This link expired or was already used. Please request a new one.');
        return;
      }
      setStatusText('Saving your spot…');
      // Creates the profile the first time a spot is saved; the dashboard retries if this fails.
      await getMe().catch(() => {});
      if (!cancelled) navigate(takeNextPath(), { replace: true });
    })();

    return () => { cancelled = true; clearTimeout(timer); };
  }, [navigate]);

  return (
    <main className="page-main gala-callback-page">
      <div className="gala-callback-inner" role="status">
        {failed ? <div className="gala-callback-icon" aria-hidden="true">!</div> : <div className="loading-spinner" />}
        <p className="loading-text">{statusText}</p>
        {failed && <p className="gala-section-sub">Taking you back so you can try again…</p>}
      </div>
    </main>
  );
}
