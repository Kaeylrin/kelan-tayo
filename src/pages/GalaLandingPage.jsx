import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalaNavbar } from '../components/gala/GalaNavbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { LegalModal } from '../components/shared/Modals.jsx';
import { sendMagicLink, getSession } from '../services/authService.js';

export function GalaLandingPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [legalModalType, setLegalModalType] = useState(null);

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
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <>
      <GalaNavbar />

      <main className="landing-main">
        <div className="view-content landing-grid-layout" style={{ marginBottom: '100px' }}>
          
          <div className="hero" style={{ textAlign: 'left', marginTop: '20px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span className="eyebrow" style={{ display: 'inline-block' }}>for the plans you make every week</span>
            </div>
            <h1 className="display" style={{ marginBottom: '16px' }}>Same crew. Same vibe. Set it once.</h1>
            <p style={{ marginBottom: '24px' }}>
              For the badminton group that plays every Saturday, the tambayan crew that meets every Friday, the study group that grinds every week, stop re-planning the same plan. Set your recurring schedule once and Kelan Tayo tracks who's free every week.
            </p>
            <div className="gala-chips" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="spot-card">
              {status === 'sent' ? (
                <>
                  <h3 className="display">Check your email!</h3>
                  <p>
                    We sent a magic link to <strong>{email}</strong>. Click it to save your spot and get started.
                  </p>
                  <button
                    className="btn-secondary btn-compact"
                    style={{ marginTop: '16px' }}
                    onClick={() => { setStatus('idle'); setEmail(''); }}
                  >
                    Use a different email
                  </button>
                </>
              ) : (
                <>
                  <h3 className="display">Save your spot</h3>
                  <p>Enter your email and we'll send you a magic link &mdash; no password needed.</p>
                  <form onSubmit={handleSubmit}>
                    <span className="spot-label">Email address</span>
                    <input
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
                      <p style={{ color: 'var(--coral)', fontSize: '13px', marginBottom: '12px' }}>{errorMsg}</p>
                    )}
                    <button
                      className="spot-btn"
                      type="submit"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? 'Sending...' : <>Save your spot &rarr;</>}
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

      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />
    </>
  );
}
