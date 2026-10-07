import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatTimeSpan } from '../../utils/storage.js';
import { lockScroll, unlockScroll } from '../../utils/smoothScroll.js';

/** Base dialog: closes on Escape or a click on the backdrop. */
function Dialog({ onClose, children, labelId }) {
  useEffect(() => {
    lockScroll();
    return unlockScroll;
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Portal to <body> so animated (transformed) ancestors can't trap the fixed overlay.
  return createPortal(
    <div className="modal" onClick={onClose} data-lenis-prevent>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ title, children, confirmLabel = 'Confirm', danger = false, busy = false, onClose, onConfirm }) {
  return (
    <Dialog onClose={busy ? () => {} : onClose} labelId="confirm-dialog-title">
      <div className={`modal-icon ${danger ? 'modal-icon-danger' : ''}`} aria-hidden="true">{danger ? '!' : '✓'}</div>
      <h2 className="display modal-title" id="confirm-dialog-title">{title}</h2>
      <div className="modal-text">{children}</div>
      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose} type="button" disabled={busy}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} type="button" disabled={busy} autoFocus>
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

export function ConfirmDateModal({ dateDetails, planName, onClose, onConfirm, busy }) {
  if (!dateDetails) return null;
  const prettyDate = new Date(`${dateDetails.date}T00:00:00`)
    .toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <ConfirmDialog
      title="Confirm Plan?"
      confirmLabel="Yes, Lock It In"
      busy={busy}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <p>
        Lock in <strong>{prettyDate}</strong>, {formatTimeSpan(dateDetails.startHour, dateDetails.endHour)} for
        “{planName || 'the group'}”?
      </p>
      <p className="modal-subtext">This will disable schedule marking for all members.</p>
    </ConfirmDialog>
  );
}
