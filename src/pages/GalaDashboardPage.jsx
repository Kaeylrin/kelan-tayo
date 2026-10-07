import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GalaNavbar } from '../components/gala/GalaNavbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { Toast } from '../components/shared/Toast.jsx';
import { useToast } from '../hooks/useToast.js';
import { getSession, signOut } from '../services/authService.js';
import { listMyGalas, createGala, updateDisplayName } from '../services/galaService.js';
import { formatDateISO } from '../utils/storage.js';
import { WEEKDAYS, formatWindow } from '../utils/galaSchedule.js';

function scheduleSummary(gala) {
  if (gala.status !== 'confirmed' || gala.confirmed_days.length === 0) return 'Still picking days';
  return gala.confirmed_days.map((d) => `${WEEKDAYS[d.weekday]} ${formatWindow(d.startHour, d.endHour)}`).join(' · ');
}

export function GalaDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [galas, setGalas] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [toast, showToast] = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStartDate, setNewStartDate] = useState(() => formatDateISO(new Date()));
  const [newEndDate, setNewEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const load = async () => {
    try {
      const result = await listMyGalas();
      setProfile(result.profile);
      setGalas(result.galas);
      setStatus('ready');
    } catch (err) {
      if (err.status === 401) navigate('/gala', { replace: true });
      else setStatus('error');
    }
  };

  useEffect(() => {
    let cancelled = false;
    getSession().then((session) => {
      if (cancelled) return;
      if (!session) navigate('/gala', { replace: true });
      else load();
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/gala', { replace: true });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) { showToast('Give your gala a name first.'); return; }
    if (newEndDate && newEndDate < newStartDate) { showToast('The end date must be after the start date.'); return; }
    setIsSubmitting(true);
    try {
      const { gala } = await createGala(newName.trim(), newStartDate, newEndDate || null);
      navigate(`/gala/${gala.id}`);
    } catch (err) {
      showToast(err.message || 'Could not create the Regular Gala.');
      setIsSubmitting(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!nameDraft.trim()) return;
    setIsSavingName(true);
    try {
      const result = await updateDisplayName(nameDraft.trim());
      setProfile(result.profile);
      setIsEditingName(false);
      showToast('Name updated!');
    } catch (err) {
      showToast(err.message || 'Could not update your name.');
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <>
      <GalaNavbar rightSlot={<button className="nav-link-secondary" type="button" onClick={handleSignOut}>Sign out</button>} />
      <Toast message={toast} />

      <main className="page-main gala-dashboard-main">
        {status === 'loading' && (
          <div className="page-loading" role="status">
            <div className="loading-spinner" />
            <span className="loading-text">Loading your galas…</span>
          </div>
        )}

        {status === 'error' && (
          <div className="gala-state-card">
            <h1 className="display">Couldn't load your galas</h1>
            <p>Check your connection and try again.</p>
            <div className="gala-state-actions">
              <button className="btn-primary btn-inline" type="button" onClick={() => { setStatus('loading'); load(); }}>Try again</button>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <div className="gala-dashboard reveal-stack">
            <div className="gala-dashboard-header">
              <div>
                <span className="eyebrow">Regular Gala</span>
                <h1 className="display">My Regular Galas</h1>
                {isEditingName ? (
                  <form className="gala-name-form" onSubmit={handleSaveName}>
                    <input
                      className="field"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      maxLength={40}
                      aria-label="Your display name"
                      autoFocus
                      disabled={isSavingName}
                    />
                    <button className="btn-primary btn-inline btn-sm" type="submit" disabled={isSavingName}>Save</button>
                    <button className="btn-secondary btn-compact" type="button" onClick={() => setIsEditingName(false)} disabled={isSavingName}>Cancel</button>
                  </form>
                ) : (
                  <p className="gala-dashboard-sub">
                    Your crew sees you as <strong>{profile.display_name}</strong>
                    <button className="gala-link-btn" type="button" onClick={() => { setNameDraft(profile.display_name); setIsEditingName(true); }}>
                      Change
                    </button>
                  </p>
                )}
              </div>
              {!isCreating && (
                <button className="btn-primary btn-inline" type="button" onClick={() => setIsCreating(true)}>
                  + New Regular Gala
                </button>
              )}
            </div>

            <div className={`gala-collapse ${isCreating ? 'is-open' : ''}`} aria-hidden={!isCreating} inert={!isCreating}>
              <div className="gala-collapse-inner">
                <form onSubmit={handleCreate} className="gala-create-form">
                  <h2 className="display">Start a new Regular Gala</h2>
                  <div className="gala-create-grid">
                    <div className="field-group field-group-wide">
                      <label className="field-label" htmlFor="galaName">Gala name</label>
                      <input id="galaName" type="text" className="field" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Saturday Badminton Squad" maxLength={60} required disabled={isSubmitting} />
                    </div>
                    <div className="field-group">
                      <label className="field-label" htmlFor="galaStart">Starts on</label>
                      <input id="galaStart" type="date" className="field" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} required disabled={isSubmitting} />
                    </div>
                    <div className="field-group">
                      <label className="field-label" htmlFor="galaEnd">Ends on (optional)</label>
                      <input id="galaEnd" type="date" className="field" value={newEndDate} min={newStartDate} onChange={(e) => setNewEndDate(e.target.value)} disabled={isSubmitting} />
                    </div>
                  </div>
                  <div className="gala-create-actions">
                    <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)} disabled={isSubmitting}>Cancel</button>
                    <button type="submit" className="btn-primary btn-inline" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating…' : 'Create & invite crew'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {galas.length === 0 ? (
              <div className="gala-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="9" cy="9" r="6" /><circle cx="15" cy="15" r="6" />
                </svg>
                <p>No Regular Galas yet. Create one for the crew you see every week, or open an invite link from a friend.</p>
              </div>
            ) : (
              <div className="gala-list">
                {galas.map((gala, i) => (
                  <Link to={`/gala/${gala.id}`} key={gala.id} className="gala-card" style={{ '--i': i }}>
                    <div className="gala-card-header">
                      <h3 className="gala-card-title display">{gala.name}</h3>
                      <div className="gala-room-badges">
                        <span className={`gala-status-badge ${gala.status}`}>{gala.status === 'confirmed' ? 'Confirmed' : 'Picking days'}</span>
                        {gala.is_paused && <span className="gala-status-badge paused">Paused</span>}
                      </div>
                    </div>
                    <div className="gala-card-schedule">{scheduleSummary(gala)}</div>
                    <div className="gala-card-meta">
                      <span>{gala.member_count} member{gala.member_count === 1 ? '' : 's'}</span>
                      <span>{gala.is_owner ? 'You own this' : 'Joined'}</span>
                      <span className="gala-card-arrow" aria-hidden="true">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
