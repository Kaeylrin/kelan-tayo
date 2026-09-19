import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalaNavbar } from '../components/gala/GalaNavbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { sendMagicLink, getSession } from '../services/authService.js';

/**
 * Route: /gala
 * Landing page for the Regular Gala feature.
 * If the user already has a session, redirects to /gala/dashboard.
 * Otherwise, shows the pitch + "Save your spot" magic-link form.
 */
export function GalaLandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'sent' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already signed in
  useEffect(() => {
    getSession().then((session) => {
      if (session) navigate('/gala/dashboard', { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await sendMagicLink(trimmed);
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <>
      <GalaNavbar />

      <main className="gala-landing-main">
        <div className="gala-landing">
          {/* Hero */}
          <div className="gala-hero">
            <span className="eyebrow">✦ New in v1.2.1</span>
            <h1 className="display gala-hero-title">Regular Gala</h1>
            <p className="gala-hero-tagline">Same crew. Same vibe. Set it once.</p>
            <p className="gala-hero-desc">
              For the badminton group that plays every Saturday, the tambayan crew that meets every
              Friday, the study group that grinds every week — stop re-planning the same plan.
              Set your recurring schedule once and Kelan Tayo tracks who's free every week.
            </p>

            {/* Feature pills */}
            <div className="gala-feature-pills">
              <span className="gala-feature-pill">📅 Recurring schedules</span>
              <span className="gala-feature-pill">👥 Group overlap view</span>
              <span className="gala-feature-pill">⚡ One-click exceptions</span>
            </div>
          </div>

          {/* Sign-in card */}
          <div className="gala-signin-card">
            {status === 'sent' ? (
              <div className="gala-sent-state">
                <div className="gala-sent-icon">📬</div>
                <h2 className="display gala-sent-title">Check your email!</h2>
                <p className="gala-sent-body">
                  We sent a magic link to <strong>{email}</strong>. Click it to save your spot and
                  get started.
                </p>
                <button
                  className="btn-secondary btn-compact"
                  style={{ marginTop: '16px' }}
                  onClick={() => { setStatus('idle'); setEmail(''); }}
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <div className="gala-signin-header">
                  <h2 className="display gala-signin-title">Save your spot</h2>
                  <p className="gala-signin-sub">
                    Enter your email and we'll send you a magic link — no password needed.
                  </p>
                </div>

                <form className="gala-email-form" onSubmit={handleSubmit}>
                  <label className="field-sublabel" htmlFor="galaEmail">Email address</label>
                  <input
                    id="galaEmail"
                    type="email"
                    className="field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={status === 'loading'}
                  />
                  {status === 'error' && (
                    <p className="gala-form-error">{errorMsg}</p>
                  )}
                  <button
                    className="btn-primary"
                    type="submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="btn-spinner" />
                        Sending…
                      </>
                    ) : (
                      'Save your spot →'
                    )}
                  </button>
                </form>

                <p className="gala-signin-note">
                  No account needed. Just an email. 🎉
                </p>
              </>
            )}
          </div>
        </div>

        {/* How it works section */}
        <div className="gala-how-section">
          <h2 className="display gala-how-title">How Regular Gala works</h2>
          <div className="gala-steps">
            <div className="gala-step">
              <div className="gala-step-num">1</div>
              <div className="gala-step-body">
                <h4>Create a Regular Gala</h4>
                <p>Name your crew — badminton barkada, tambayan, study group — and set a start date.</p>
              </div>
            </div>
            <div className="gala-step">
              <div className="gala-step-num">2</div>
              <div className="gala-step-body">
                <h4>Everyone marks their weekly free times</h4>
                <p>Each member marks which hours they're busy on a weekly template. Once. Done.</p>
              </div>
            </div>
            <div className="gala-step">
              <div className="gala-step-num">3</div>
              <div className="gala-step-body">
                <h4>Confirm the recurring slot</h4>
                <p>The group owner confirms the best day+time. Kelan Tayo locks it in and tracks exceptions automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onOpenLegal={() => {}} />
    </>
  );
}
