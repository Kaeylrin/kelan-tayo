import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GalaNavbar } from '../components/gala/GalaNavbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';
import { Toast } from '../components/shared/Toast.jsx';
import { GalaMemberSchedule } from '../components/gala/GalaMemberSchedule.jsx';
import { GalaOverlapView } from '../components/gala/GalaOverlapView.jsx';
import { GalaExceptionManager } from '../components/gala/GalaExceptionManager.jsx';
import { GalaMembersPanel } from '../components/gala/GalaMembersPanel.jsx';
import { useToast } from '../hooks/useToast.js';
import { getSession } from '../services/authService.js';
import { loadGala, joinGala } from '../services/galaService.js';
import { WEEKDAYS_FULL, formatWindow, getUpcomingSessions } from '../utils/galaSchedule.js';

const TABS = [
  { id: 'week', label: 'My week' },
  { id: 'overlap', label: 'Best times' },
  { id: 'exceptions', label: 'Exceptions' },
  { id: 'crew', label: 'Crew' },
];

const prettyDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', opts);

export function GalaRoomPage() {
  const { galaId } = useParams();
  // Remount per gala so state never leaks between galas.
  return <GalaRoom key={galaId} galaId={galaId} />;
}

function GalaRoom({ galaId }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notfound | error
  const [activeTab, setActiveTab] = useState('week');
  const [isJoining, setIsJoining] = useState(false);
  const [toast, showToast] = useToast();

  const sendToSignIn = useCallback(() => {
    navigate('/gala', { replace: true, state: { next: `/gala/${galaId}` } });
  }, [navigate, galaId]);

  const fetchGala = useCallback(async () => {
    try {
      const result = await loadGala(galaId);
      setData(result);
      setStatus('ready');
    } catch (err) {
      if (err.status === 401) sendToSignIn();
      else if (err.status === 404 || err.status === 400) setStatus('notfound');
      else setStatus('error');
    }
  }, [galaId, sendToSignIn]);

  useEffect(() => {
    let cancelled = false;
    getSession().then((session) => {
      if (cancelled) return;
      if (!session) sendToSignIn();
      else fetchGala();
    });
    return () => { cancelled = true; };
  }, [fetchGala, sendToSignIn]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await joinGala(galaId);
      await fetchGala();
      showToast(`Welcome to ${data.gala.name}! Mark your usual week next.`);
    } catch (err) {
      showToast(err.message || 'Could not join this Regular Gala.');
    } finally {
      setIsJoining(false);
    }
  };

  const copyInvite = () => {
    const url = `${window.location.origin}/gala/${galaId}`;
    navigator.clipboard?.writeText(url)
      .then(() => showToast('Invite link copied!'))
      .catch(() => showToast(url));
  };

  const onGalaUpdated = (gala) => setData((prev) => ({ ...prev, gala: { ...prev.gala, ...gala } }));

  const myPatterns = useMemo(
    () => (data?.patterns || []).filter((p) => p.profile_id === data.profile.id),
    [data],
  );
  const upcoming = useMemo(
    () => (data?.isMember ? getUpcomingSessions(data.gala, data.exceptions, { count: 4 }) : []),
    [data],
  );

  const backButton = (
    <Link to="/gala/dashboard" className="nav-link-secondary">My galas</Link>
  );

  if (status !== 'ready') {
    return (
      <>
        <GalaNavbar rightSlot={backButton} />
        <main className="page-main gala-room-main">
          {status === 'loading' ? (
            <div className="page-loading" role="status">
              <div className="loading-spinner" />
              <span className="loading-text">Loading your gala…</span>
            </div>
          ) : (
            <div className="gala-state-card">
              <h1 className="display">{status === 'notfound' ? 'Gala not found' : 'Something went wrong'}</h1>
              <p>
                {status === 'notfound'
                  ? 'This Regular Gala does not exist or was deleted. Double-check the invite link.'
                  : 'We could not load this Regular Gala. Check your connection and try again.'}
              </p>
              <div className="gala-state-actions">
                {status === 'error' && (
                  <button className="btn-primary btn-inline" type="button" onClick={() => { setStatus('loading'); fetchGala(); }}>
                    Try again
                  </button>
                )}
                <Link className="btn-secondary" to="/gala/dashboard">Back to my galas</Link>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </>
    );
  }

  const { gala, isMember, isOwner, ownerName, memberCount, profile } = data;
  const isConfirmed = gala.status === 'confirmed';

  return (
    <>
      <GalaNavbar rightSlot={backButton} />
      <Toast message={toast} />

      <main className="page-main gala-room-main">
        <header className="gala-room-header">
          <div className="gala-room-title-row">
            <h1 className="display">{gala.name}</h1>
            <div className="gala-room-badges">
              <span className={`gala-status-badge ${gala.status}`}>{isConfirmed ? 'Confirmed' : 'Picking days'}</span>
              {gala.is_paused && <span className="gala-status-badge paused">Paused</span>}
            </div>
          </div>
          <div className="gala-room-meta">
            <span>{memberCount} member{memberCount === 1 ? '' : 's'}</span>
            {ownerName && <span>Owner: {isOwner ? 'You' : ownerName}</span>}
            <span>
              From {prettyDate(gala.start_date)}
              {gala.end_date ? ` to ${prettyDate(gala.end_date)}` : ', no end date'}
            </span>
          </div>
          {isMember && (
            <button className="btn-copy-action gala-invite-btn" type="button" onClick={copyInvite}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
              </svg>
              Copy invite link
            </button>
          )}
        </header>

        {!isMember ? (
          <div className="gala-state-card gala-join-card">
            <h2 className="display">You're invited!</h2>
            <p>
              {ownerName ? <><strong>{ownerName}</strong> invited you</> : "You've been invited"} to join <strong>{gala.name}</strong>.
              Joining lets you mark your usual week and see when the crew meets.
            </p>
            <p className="gala-section-sub">You'll appear as <strong>{profile.display_name}</strong>. You can change this on your dashboard.</p>
            <button className="btn-primary btn-inline" type="button" onClick={handleJoin} disabled={isJoining}>
              {isJoining ? 'Joining…' : 'Join this Regular Gala'}
            </button>
          </div>
        ) : (
          <>
            {gala.is_paused && (
              <div className="gala-banner gala-banner-paused">
                <strong>This Regular Gala is paused.</strong> {isOwner ? 'Resume it from the Crew tab when you are ready.' : 'The owner will resume it when the crew is back.'}
              </div>
            )}

            {isConfirmed && !gala.is_paused && (
              <div className="gala-banner gala-confirmed-banner">
                <div className="gala-confirmed-main">
                  <span className="gala-confirmed-icon" aria-hidden="true">✓</span>
                  <div>
                    <div className="gala-confirmed-label">Your crew meets every</div>
                    {gala.confirmed_days.map((d) => (
                      <div key={d.weekday} className="gala-confirmed-slot display">
                        {WEEKDAYS_FULL[d.weekday]}, {formatWindow(d.startHour, d.endHour)}
                      </div>
                    ))}
                  </div>
                </div>
                {upcoming.length > 0 && (
                  <ul className="gala-upcoming">
                    {upcoming.map((s) => (
                      <li key={s.date} className={`gala-upcoming-item is-${s.status}`}>
                        <span className="gala-upcoming-date">{prettyDate(s.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="gala-upcoming-status">
                          {s.status === 'skipped' ? 'Skipped' : s.status === 'extra' ? 'Extra session' : formatWindow(s.startHour, s.endHour)}
                          {s.note && ` · ${s.note}`}
                          {s.out.length > 0 && s.status !== 'skipped' && ` · ${s.out.join(', ')} out`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="tabs gala-tabs" role="tablist" aria-label="Regular Gala sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`gala-tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls="gala-tabpanel"
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="gala-tab-content" id="gala-tabpanel" role="tabpanel" aria-labelledby={`gala-tab-${activeTab}`} key={activeTab}>
              {activeTab === 'week' && (
                <GalaMemberSchedule
                  galaId={gala.id}
                  myPatterns={myPatterns}
                  isConfirmed={isConfirmed}
                  onSaved={fetchGala}
                  showToast={showToast}
                />
              )}
              {activeTab === 'overlap' && (
                <GalaOverlapView
                  gala={gala}
                  members={data.members}
                  patterns={data.patterns}
                  isOwner={isOwner}
                  onGalaUpdated={onGalaUpdated}
                  showToast={showToast}
                />
              )}
              {activeTab === 'exceptions' && (
                <GalaExceptionManager
                  gala={gala}
                  profileId={profile.id}
                  isOwner={isOwner}
                  exceptions={data.exceptions}
                  onChanged={fetchGala}
                  showToast={showToast}
                />
              )}
              {activeTab === 'crew' && (
                <GalaMembersPanel
                  gala={gala}
                  members={data.members}
                  profileId={profile.id}
                  isOwner={isOwner}
                  onChanged={fetchGala}
                  onGalaUpdated={onGalaUpdated}
                  showToast={showToast}
                />
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
