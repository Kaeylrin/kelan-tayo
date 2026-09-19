import React, { useState } from 'react';
import { addException, deleteException } from '../../services/galaService.js';

/**
 * Manages one-off exceptions (skip/add sessions) for a Regular Gala.
 *
 * Props:
 *  - galaId
 *  - profileId: current user's profile id
 *  - ownerId: gala owner's profile id
 *  - exceptions: existing gala_exceptions rows (with profiles embedded)
 *  - onChanged: callback to refresh exceptions list
 */
export function GalaExceptionManager({ galaId, profileId, ownerId, exceptions, onChanged }) {
  const [date, setDate] = useState('');
  const [type, setType] = useState('Skip');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const isOwner = profileId === ownerId;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!date) { setFormMsg('Please pick a date.'); return; }
    setIsSubmitting(true);
    setFormMsg('');
    try {
      await addException(galaId, profileId, date, type, note);
      setDate('');
      setType('Skip');
      setNote('');
      setFormMsg('Exception added!');
      if (onChanged) onChanged();
      setTimeout(() => setFormMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setFormMsg('Error adding exception.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (exId) => {
    setDeletingId(exId);
    try {
      await deleteException(exId);
      if (onChanged) onChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="gala-exception-manager">
      <div className="gala-section-header">
        <div>
          <h3 className="display gala-section-title">Exceptions</h3>
          <p className="gala-section-sub">
            Flag dates where the group is skipping or adding a session.
            {!isOwner && <span> Only the gala owner can add gala-wide exceptions.</span>}
          </p>
        </div>
      </div>

      {/* Existing exceptions list */}
      {exceptions && exceptions.length > 0 ? (
        <div className="gala-exception-list">
          {exceptions.map((ex) => {
            const canDelete = isOwner || ex.profile_id === profileId;
            return (
              <div key={ex.id} className="gala-exception-item">
                <div className="gala-exception-left">
                  <span className={`gala-ex-type-badge gala-ex-${ex.type.toLowerCase()}`}>
                    {ex.type === 'Skip' ? '✕ Skip' : '+ Add'}
                  </span>
                  <div className="gala-exception-detail">
                    <span className="gala-exception-date">{formatDate(ex.date)}</span>
                    {ex.note && <span className="gala-exception-note">{ex.note}</span>}
                    {ex.profiles?.display_name && (
                      <span className="gala-exception-by">by {ex.profiles.display_name}</span>
                    )}
                  </div>
                </div>
                {canDelete && (
                  <button
                    className="gala-ex-delete-btn"
                    type="button"
                    onClick={() => handleDelete(ex.id)}
                    disabled={deletingId === ex.id}
                    title="Remove exception"
                    aria-label="Delete exception"
                  >
                    {deletingId === ex.id ? '…' : '✕'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="gala-empty-state gala-empty-sm">
          <p>No exceptions yet. Skipping a session or adding a bonus one? Log it here.</p>
        </div>
      )}

      {/* Add exception form — owner can add gala-wide; anyone can add for themselves */}
      {isOwner && (
        <form className="gala-exception-form" onSubmit={handleAdd}>
          <div className="gala-ex-form-title">Add an exception</div>
          <div className="gala-ex-form-row">
            <div className="gala-ex-field">
              <label className="field-sublabel" htmlFor="exDate">Date</label>
              <input
                id="exDate"
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="gala-ex-field gala-ex-type-field">
              <label className="field-sublabel" htmlFor="exType">Type</label>
              <select
                id="exType"
                className="field"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Skip">Skip — no session this date</option>
                <option value="Add">Add — bonus session this date</option>
              </select>
            </div>
          </div>
          <div className="gala-ex-field">
            <label className="field-sublabel" htmlFor="exNote">Note (optional)</label>
            <input
              id="exNote"
              type="text"
              className="field"
              placeholder="e.g. Holiday, court unavailable, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="gala-ex-form-footer">
            {formMsg && <span className="gala-save-msg">{formMsg}</span>}
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '9px 22px' }}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding…' : 'Add Exception'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
