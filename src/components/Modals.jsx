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

export function LegalModal({ type, onClose }) {
  if (!type) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content legal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="display modal-title">
          {type === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
        </h2>
        <div className="legal-body">
          <p>Kelan Tayo is a zero-login group scheduling tool designed with privacy first.</p>
          <ul>
            <li><strong>No Accounts:</strong> No email, credentials, or personal tracking.</li>
            <li><strong>Isolated Room Spaces:</strong> All busy schedules and room configs exist under local browser storage.</li>
            <li><strong>Inverted Schedule Privacy:</strong> Group members only see aggregate free time windows and marked schedules.</li>
          </ul>
        </div>
        <button
          className="btn-secondary"
          style={{ marginTop: '18px', width: '100%' }}
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
