import React from 'react';

export function ConfirmDateModal({ dateDetails, planName, onClose, onConfirm }) {
  if (!dateDetails) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">&#10003;</div>
        <h2 className="display modal-title">Confirm Plan?</h2>
        <p className="modal-text">
          Are you sure you want to lock in <strong>{new Date(dateDetails.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</strong> for "{planName || 'the group'}"?
          <br/>
          <span style={{fontSize: '14px', color: 'var(--cream-muted)'}}>This will disable schedule marking for all members.</span>
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button className="btn-secondary" onClick={onClose} type="button" style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm} type="button" style={{ flex: 1 }}>
            Yes, Lock It In
          </button>
        </div>
      </div>
    </div>
  );
}
