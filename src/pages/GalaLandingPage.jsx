import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GalaNavbar } from '../components/gala/GalaNavbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { sendMagicLink, getSession, isSafeNextPath } from '../services/authService.js';

const EMAIL_RE = /^[^s@]+@[^s@]+.[^s@]+$/;

export function GalaLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = isSafeNextPath(location.state?.next) ? location.state.next : null;
  const isInvite = Boolean(next && next !== '/gala/dashboard');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getSession().then((session) => {
      if (session) navigate(next || '/gala/dashboard', { replace: true });
    });
  }, [navigate, next]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return;
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed) || trimmed.length > 254) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await sendMagicLink(trimmed, next);
      setStatus('sent');
    } catch (err) {
      const rateLimited = err.status === 429 || /rate limit|seconds/i.test(err.message || '');
      setErrorMsg(rateLimited
        ? 'Too many links requested. Please wait a minute, then try again.'
        : err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <>
      <GalaNavbar />

      <main className="landing-main">
        <div className="view-content landing-grid-layout gala-landing-grid">
          <div className="hero gala-landing-hero">
            <span className="eyebrow">for the plans you make every week</span>
            <h1 className="display">Same crew. Same vibe. Set it once.</h1>
            <p>
              For the badminton group that plays every Saturday, the tambayan crew that meets every Friday, the study group that grinds every week, stop re-planning the same plan. Set your recurring schedule once and Kelan Tayo tracks who's free every week.
            </p>
            <div className="gala-chips gala-chips-left">
              <span className="gala-chip">
                <svg className="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 10h18M7 3v4M17 3v4M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>
                </svg>
                Recurring schedules
              </span>
              <span className="gala-chip">
                <svg className="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/>
                </svg>
                Group overlap view
              </span>
              <span className="gala-chip">
                <svg className="chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>
                </svg>
                One-click exceptions
              </span>
            </div>
          </div>

          <div className="gala-landing-card-col">
            <div className="spot-card">
              {status === 'sent' ? (
                <>
                  <div className="spot-sent-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></svg>
                  </div>
                  <h3 className="display">Check your email!</h3>
                  <p role="status">
                    We sent a magic link to <strong>{email.trim()}</strong>. Open it on this device to save your spot{isInvite ? ' and join the gala' : ''}.
                  </p>
                  <button
                    className="btn-secondary btn-compact"
                    onClick={() => { setStatus('idle'); setEmail(''); }}
                  >
                    Use a different email
                  </button>
                </>
              ) : (
                <>
                  <h3 className="display">{isInvite ? "You've been invited!" : 'Save your spot'}</h3>
                  <p>
                    {isInvite
                      ? 'Save your spot with your email to join the gala. We will send a magic link, no password needed.'
                      : "Enter your email and we'll send you a magic link. No password needed."}
                  </p>
                  <form onSubmit={handleSubmit}>
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                    <label className="spot-label" htmlFor="spotEmail">Email address</label>
                    <input
                      id="spotEmail"
                      className="spot-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      disabled={status === 'loading'}
                    />
                    {status === 'error' && (
                      <p className="form-error" role="alert">{errorMsg}</p>
                    )}
                    <button
                      className="spot-btn"
                      type="submit"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Sending…' : <>Save your spot &rarr;</>}
                    </button>
                  </form>
                  <div className="spot-note">No account needed. Just an email.</div>
                </>
              )}
            </div>
          </div>
        </div>

        <section className="how-it-works">
          <div className="section-heading">
            <div className="section-eyebrow">How Regular Gala works</div>
            <h2 className="display">Set it once. That's it.</h2>
          </div>

          <div className="gala-steps-grid">
            <div className="gala-step-card">
              <div className="step-number">1</div>
              <h3 className="display">Create your gala</h3>
              <p>Name it, whether it's the badminton squad or the Friday tambayan, and invite your crew with a link. No group chat spam needed.</p>
            </div>
            <div className="gala-step-card">
              <div className="step-number">2</div>
              <h3 className="display">Mark your weekly schedule</h3>
              <p>Same drag-and-mark you already know from Kelan Tayo, just applied to your usual week instead of a one-off date range.</p>
            </div>
            <div className="gala-step-card">
              <div className="step-number">3</div>
              <h3 className="display">Set it and forget it</h3>
              <p>The gala's owner confirms the recurring days once. Exceptions handle the one-off breaks, holidays, someone's out, no re-planning every week.</p>
            </div>
          </div>
        </section>

        <section className="reassure-section">
          <div className="reassure-card">
            <p><strong>Still the same Kelan Tayo.</strong> Regular Gala is built for recurring hangouts with your crew, not a work tool. The base app stays exactly as it is, no login, no accounts, create a one-off plan anytime without ever touching this.</p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
