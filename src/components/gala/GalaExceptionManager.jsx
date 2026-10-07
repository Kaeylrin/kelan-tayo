import { useState } from 'react';
import { addException, deleteException } from '../../services/galaService.js';
import { formatDateISO } from '../../utils/storage.js';

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const EXCEPTION_KINDS = {
  'gala-skip': { scope: 'gala', type: 'skip', label: 'No session (whole crew)' },
  'gala-add': { scope: 'gala', type: 'add', label: 'Extra session (whole crew)' },
  'me-skip': { scope: 'me', type: 'skip', label: "I can't make it" },
};

function badgeFor(ex) {
  if (ex.profile_id) return { label: 'Out', className: 'gala-ex-out' };
  return ex.type === 'add' ? { label: 'Extra', className: 'gala-ex-add' } : { label: 'Skip', className: 'gala-ex-skip' };
}

/**
 * One-off changes to a Regular Gala. The owner can skip or add a session for
 * everyone; any member can mark a date they personally can't make.
 */
export function GalaExceptionManager({ gala, profileId, isOwner, exceptions, onChanged, showToast }) {
  const [date, setDate] = useState('');
  const [kind, setKind] = useState(isOwner ? 'gala-skip' : 'me-skip');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showPast, setShowPast] = useState(false);

  const today = formatDateISO(new Date());
  const minDate = gala.start_date > today ? gala.start_date : today;
  const upcoming = exceptions.filter((ex) => ex.date >= today);
  const past = exceptions.filter((ex) => ex.date < today).reverse();
  const kinds = isOwner ? Object.keys(EXCEPTION_KINDS) : ['me-skip'];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!date) { showToast('Please pick a date.'); return; }
    setIsSubmitting(true);
    try {
      const { scope, type } = EXCEPTION_KINDS[kind];
      await addException(gala.id, { date, type, scope, note });
      setDate('');
      setNote('');
      showToast('Exception added!');
      await onChanged();
    } catch (err) {
      showToast(err.message || 'Could not add the exception.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteException(id);
      showToast('Exception removed.');
      await onChanged();
    } catch (err) {
      showToast(err.message || 'Could not remove the exception.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderItem = (ex) => {
    const badge = badgeFor(ex);
    const canDelete = isOwner || ex.profile_id === profileId;
    return (
      <li key={ex.id} className="gala-exception-item">
        <span className={`gala-ex-type-badge ${badge.className}`}>{badge.label}</span>
        <div className="gala-exception-detail">
          <span className="gala-exception-date">{formatDate(ex.date)}</span>
          <span className="gala-exception-meta">
            {ex.profile_id ? `${ex.profile_id === profileId ? 'You' : ex.display_name} can't make it` : 'Whole crew'}
            {ex.note && <> · {ex.note}</>}
          </span>
        </div>
        {canDelete && (
          <button
            className="gala-ex-delete-btn"
            type="button"
            onClick={() => handleDelete(ex.id)}
            disabled={deletingId === ex.id}
            aria-label={`Remove exception on ${formatDate(ex.date)}`}
            title="Remove"
          >
            {deletingId === ex.id ? '…' : '✕'}
          </button>
        )}
      </li>
    );
  };

  return (
    <section className="gala-panel gala-exception-manager">
      <div className="gala-section-header">
        <div>
          <h2 className="display gala-section-title">Exceptions</h2>
          <p className="gala-section-sub">
            One-off changes for a single date. The regular schedule stays the same every other week.
          </p>
        </div>
      </div>

      <form className="gala-exception-form" onSubmit={handleAdd}>
        <div className="gala-ex-form-row">
          <div className="gala-ex-field">
            <label className="field-sublabel" htmlFor="exDate">Date</label>
            <input
              id="exDate"
              type="date"
              className="field"
              value={date}
              min={minDate}
              max={gala.end_date || undefined}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="gala-ex-field">
            <label className="field-sublabel" htmlFor="exKind">What's happening</label>
            <select id="exKind" className="field" value={kind} onChange={(e) => setKind(e.target.value)} disabled={kinds.length === 1}>
              {kinds.map((k) => <option key={k} value={k}>{EXCEPTION_KINDS[k].label}</option>)}
            </select>
          </div>
        </div>
        <div className="gala-ex-field">
          <label className="field-sublabel" htmlFor="exNote">Note (optional)</label>
          <input
            id="exNote"
            type="text"
            className="field"
            placeholder="e.g. Holiday, court unavailable, out of town"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="gala-ex-form-footer">
          {!isOwner && <span className="gala-section-sub">Only the owner can skip or add a session for everyone.</span>}
          <button className="btn-primary btn-inline" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Add exception'}
          </button>
        </div>
      </form>

      {upcoming.length > 0 ? (
        <ul className="gala-exception-list">{upcoming.map(renderItem)}</ul>
      ) : (
        <div className="gala-empty-state gala-empty-sm">
          <p>No upcoming exceptions. Skipping a week or adding a bonus session? Log it above.</p>
        </div>
      )}

      {past.length > 0 && (
        <div className="gala-past">
          <button type="button" className="gala-link-btn" onClick={() => setShowPast((v) => !v)} aria-expanded={showPast}>
            {showPast ? 'Hide' : 'Show'} past exceptions ({past.length})
          </button>
          {showPast && <ul className="gala-exception-list is-past">{past.map(renderItem)}</ul>}
        </div>
      )}
    </section>
  );
}
