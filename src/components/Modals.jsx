import React from 'react';

const PrivacyContent = () => (
  <>
    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>1. What This App Is</h3>
    <p>Kelan Tayo is a group scheduling tool. It lets a group of people create a shared plan, mark when they are free within a specific date range, and agree on a date to meet up. This policy explains what information the app collects and how it is used.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>2. Information We Collect</h3>
    <p>Kelan Tayo does not require an account, a password, or an email address to use. The information collected is limited to what is needed for a room to function:</p>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>Display name: the name you type when you join a room. This can be anything, it does not need to be your real name</li>
      <li style={{ marginBottom: '6px' }}>Plan details: the plan name and date range entered when a room is created</li>
      <li style={{ marginBottom: '6px' }}>Availability: the time blocks you mark as busy or free within a room's date range</li>
      <li style={{ marginBottom: '6px' }}>Room activity: which room a piece of data belongs to, and basic timestamps such as when a room or a response was created or last updated</li>
    </ul>
    <p>We do not collect your email address, phone number, government ID, precise location, or any payment information, because the app does not use any of these.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>3. How Your Information Is Used</h3>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>To show your submitted availability to other members of the same room</li>
      <li style={{ marginBottom: '6px' }}>To calculate overlapping free time and generate the best-match and backup date options for a room</li>
      <li style={{ marginBottom: '6px' }}>To let the room's creator confirm a final date, and to display that confirmed plan to everyone in the room</li>
    </ul>
    <p>Your information is only ever used within the room it was submitted to. It is not used for advertising, profiling, or shared with any other room.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>4. Where Your Information Is Stored</h3>
    <p>Room, member, and availability data is stored in a hosted database (Supabase), not in your browser alone, so that everyone in a room can see the same shared plan regardless of the device they use. Access to a room's data requires that room's specific link or code. Rooms are not listed, searchable, or browsable by anyone who does not already have that link or code.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>5. How Long Data Is Kept</h3>
    <p>Room data is kept for as long as the room remains active or useful for reference. Since Kelan Tayo does not use accounts, there is no personal profile tied to your data beyond the display name and availability you submitted inside a specific room. If you would like a room's data removed, you can request this using the contact information below.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>6. Who Can See Your Information</h3>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>Other members of the same room can see your display name and the availability you submitted</li>
      <li style={{ marginBottom: '6px' }}>The room's creator can additionally see the confirm and unlock controls, but does not receive any information beyond what other members already see</li>
      <li style={{ marginBottom: '6px' }}>Nobody outside a room, including other Kelan Tayo users in different rooms, can see that room's data</li>
    </ul>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>7. Cookies and Local Storage</h3>
    <p>Kelan Tayo may use minimal local browser storage to remember which room and member you are currently viewing, so the app can load your correct view when you return to a link. This is not used for tracking or advertising, and it does not replace the shared database used to store your actual room data.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>8. Children's Privacy</h3>
    <p>Kelan Tayo is not directed at children and does not knowingly collect information from anyone below the applicable age of digital consent in their region. Since no account or personal identifying information is required to use the app, exposure is limited to what a user chooses to type into a room.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>9. Changes to This Policy</h3>
    <p>This policy may be updated as the app changes. The version number and last updated date at the top of this document will reflect the most current version.</p>
  </>
);

const TermsContent = () => (
  <>
    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>1. Acceptance of These Terms</h3>
    <p>By creating or joining a room on Kelan Tayo, you agree to these terms. If you do not agree, please do not use the app.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>2. What Kelan Tayo Does</h3>
    <p>Kelan Tayo helps a group of people find a date and time when most or all of them are free, based on availability that each member submits within a shared room. The room's creator may confirm a final date, which the app then displays to everyone in that room.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>3. No Account Required</h3>
    <p>Kelan Tayo does not require you to create an account, provide a password, or verify your identity. Access to a room is based only on having that room's link or code. Because of this, Kelan Tayo has no reliable way to verify who is actually using a room, and you are responsible for only sharing a room's link or code with people you intend to include in that plan.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>4. Room Creators</h3>
    <p>The person who creates a room is automatically recorded as that room's creator. Only the creator can confirm a final date or unlock a confirmed room to pick again. Kelan Tayo is not responsible for disputes between members of a room over which date should be confirmed, that decision is left to the group and the creator.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>5. Acceptable Use</h3>
    <p>When using Kelan Tayo, you agree not to:</p>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>Use the app for any unlawful purpose</li>
      <li style={{ marginBottom: '6px' }}>Enter content in a plan name, display name, or any other field that is abusive, harassing, or intended to harm another person</li>
      <li style={{ marginBottom: '6px' }}>Attempt to access a room you were not given the link or code for</li>
      <li style={{ marginBottom: '6px' }}>Attempt to disrupt, overload, or interfere with the app's normal operation</li>
    </ul>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>6. Accuracy of Information</h3>
    <p>Kelan Tayo relies on the availability that members choose to submit. The app does not verify that submitted availability is accurate. Any date confirmed through the app is only as reliable as the information members chose to enter.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>7. No Warranty</h3>
    <p>Kelan Tayo is provided as is, without warranties of any kind, whether express or implied. We do not guarantee that the app will be available at all times, free of errors, or free of interruptions.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>8. Limitation of Liability</h3>
    <p>To the fullest extent permitted by law, Kelan Tayo and its creator are not liable for any indirect, incidental, or consequential damages arising from your use of the app, including missed plans, scheduling conflicts, or disputes between members of a room.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>9. Data and Room Content</h3>
    <p>Details on what information is collected and how it is used are covered in the Privacy Policy. By using Kelan Tayo, you also agree to that policy.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>10. Termination or Removal of a Room</h3>
    <p>Rooms found to violate the acceptable use section of these terms may be removed without notice.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>11. Changes to These Terms</h3>
    <p>These terms may be updated as the app changes. The version number and last updated date at the top of this document will reflect the most current version. Continued use of Kelan Tayo after changes are posted means you accept the updated terms.</p>
  </>
);

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
      <div className="modal-content legal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <h2 className="display modal-title" style={{ flexShrink: 0 }}>
          {type === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
        </h2>
        <div className="legal-body" style={{ overflowY: 'auto', paddingRight: '12px', flex: 1, textAlign: 'left', fontSize: '14px', lineHeight: '1.6' }}>
          {type === 'privacy' ? <PrivacyContent /> : <TermsContent />}
        </div>
        <div style={{ flexShrink: 0, marginTop: '20px' }}>
          <button
            className="btn-secondary"
            style={{ width: '100%' }}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
