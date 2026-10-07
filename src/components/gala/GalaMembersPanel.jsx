import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATAR_COLORS } from '../../constants/config.js';
import { setGalaPaused, setMemberPaused, leaveGala, deleteGala } from '../../services/galaService.js';
import { ConfirmDialog } from '../shared/Modals.jsx';

/** Members list, pause controls, and leave/delete for a Regular Gala. */
export function GalaMembersPanel({ gala, members, profileId, isOwner, onChanged, onGalaUpdated, showToast }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null); // which control is working
  const [dangerOpen, setDangerOpen] = useState(false);

  const me = members.find((m) => m.profile_id === profileId);

  const run = async (key, fn, successMsg) => {
    setBusy(key);
    try {
      await fn();
      if (successMsg) showToast(successMsg);
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const toggleMyPause = () => run('me', async () => {
    await setMemberPaused(gala.id, !me.is_paused);
    await onChanged();
  }, me?.is_paused ? "Welcome back! You're counted again." : "You're paused. Your schedule is kept for when you're back.");

  const toggleGalaPause = () => run('gala', async () => {
    const { gala: updated } = await setGalaPaused(gala.id, !gala.is_paused);
    onGalaUpdated(updated);
  }, gala.is_paused ? 'Regular Gala resumed!' : 'Regular Gala paused.');

  const handleDanger = () => run('danger', async () => {
    if (isOwner) await deleteGala(gala.id);
    else await leaveGala(gala.id);
    navigate('/gala/dashboard', { replace: true });
  }, isOwner ? 'Regular Gala deleted.' : 'You left the Regular Gala.');

  return (
    <section className="gala-panel gala-members-panel">
      <div className="gala-section-header">
        <div>
          <h2 className="display gala-section-title">The crew</h2>
          <p className="gala-section-sub">{members.length} member{members.length === 1 ? '' : 's'}. Paused members keep their schedule but aren't counted.</p>
        </div>
      </div>

      <ul className="gala-member-list">
        {members.map((m, i) => (
          <li key={m.profile_id} className={`gala-member-row ${m.is_paused ? 'is-paused' : ''}`} style={{ '--i': i }}>
            <span className="avatar gala-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }} aria-hidden="true">
              {m.display_name.charAt(0).toUpperCase()}
            </span>
            <span className="gala-member-name">
              {m.display_name}
              {m.profile_id === profileId && <span className="gala-member-you"> (you)</span>}
            </span>
            {m.is_owner && <span className="gala-pill gala-pill-gold">Owner</span>}
            {m.is_paused && <span className="gala-pill">Paused</span>}
          </li>
        ))}
      </ul>

      <div className="gala-settings">
        {me && (
          <div className="gala-setting">
            <div>
              <div className="gala-setting-title">Pause just me</div>
              <div className="gala-section-sub">On leave or out for a while? You won't count toward the overlap until you're back.</div>
            </div>
            <button className={`gala-switch ${me.is_paused ? 'is-on' : ''}`} type="button" role="switch" aria-checked={me.is_paused} onClick={toggleMyPause} disabled={busy !== null} aria-label="Pause just me">
              <span />
            </button>
          </div>
        )}

        {isOwner && (
          <div className="gala-setting">
            <div>
              <div className="gala-setting-title">Pause the whole gala</div>
              <div className="gala-section-sub">Semester break? Upcoming sessions stop showing until you resume. Nothing is deleted.</div>
            </div>
            <button className={`gala-switch ${gala.is_paused ? 'is-on' : ''}`} type="button" role="switch" aria-checked={gala.is_paused} onClick={toggleGalaPause} disabled={busy !== null} aria-label="Pause the whole gala">
              <span />
            </button>
          </div>
        )}

        <div className="gala-setting gala-setting-danger">
          <div>
            <div className="gala-setting-title">{isOwner ? 'Delete this Regular Gala' : 'Leave this Regular Gala'}</div>
            <div className="gala-section-sub">
              {isOwner ? 'Removes it for everyone, including all schedules and exceptions.' : 'Your saved week and personal exceptions are removed.'}
            </div>
          </div>
          <button className="btn-danger-outline" type="button" onClick={() => setDangerOpen(true)} disabled={busy !== null}>
            {isOwner ? 'Delete' : 'Leave'}
          </button>
        </div>
      </div>

      {dangerOpen && (
        <ConfirmDialog
          title={isOwner ? 'Delete this Regular Gala?' : 'Leave this Regular Gala?'}
          confirmLabel={isOwner ? 'Delete for everyone' : 'Leave'}
          danger
          busy={busy === 'danger'}
          onClose={() => setDangerOpen(false)}
          onConfirm={handleDanger}
        >
          <p>
            {isOwner
              ? <>“{gala.name}” and everyone's schedules will be gone for good. This can't be undone.</>
              : <>You can rejoin later with the invite link, but you'll need to mark your week again.</>}
          </p>
        </ConfirmDialog>
      )}
    </section>
  );
}
