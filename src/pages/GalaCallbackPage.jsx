import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getOrCreateProfile } from '../services/authService.js';

/**
 * Route: /gala/callback
 * Supabase redirects here after the user clicks the magic link.
 * On mount: reads the session, ensures a profile exists, then redirects to /gala/dashboard.
 */
export function GalaCallbackPage() {
  const navigate = useNavigate();
  const [statusText, setStatusText] = useState('Verifying your link…');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        // Supabase sets the session from the URL hash automatically.
        // Give it a brief moment to process the hash params.
        await new Promise((r) => setTimeout(r, 600));

        setStatusText('Saving your spot…');
        const session = await getSession();

        if (!session) {
          // The link may have expired or already been used
          setStatusText('Link expired or already used. Redirecting…');
          setTimeout(() => {
            if (!cancelled) navigate('/gala', { replace: true });
          }, 2000);
          return;
        }

        await getOrCreateProfile(session);

        if (!cancelled) {
          setStatusText('All set! Heading to your dashboard…');
          navigate('/gala/dashboard', { replace: true });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setStatusText('Something went wrong. Redirecting…');
          setTimeout(() => navigate('/gala', { replace: true }), 2000);
        }
      }
    };

    handleCallback();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <main className="gala-callback-page">
      <div className="gala-callback-inner">
        <div className="loading-spinner" />
        <p className="loading-text">{statusText}</p>
      </div>
    </main>
  );
}
