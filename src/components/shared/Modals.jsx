import React from 'react';

const PrivacyContent = () => (
  <>
    <p style={{ color: 'var(--cream-muted)', marginBottom: '16px' }}>Last updated: September 20, 2026 &middot; Version 1.3.2</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>1. What This App Is</h3>
    <p>Kelan Tayo is a group scheduling tool with two parts. The base app lets a group create a shared plan, mark when they're free within a date range, and agree on a date to meet up, no account needed. Regular Gala is a separate, optional feature for groups who want a recurring weekly schedule instead of a one-off plan, and requires a lightweight, passwordless sign-in. This policy covers both.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>2. Information We Collect</h3>
    <p>The base app collects only what's needed for a room to function:</p>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>Display name: the name you type when you join a room, can be anything, doesn't need to be your real name</li>
      <li style={{ marginBottom: '6px' }}>Plan details: the plan name, date range, and preferred hours entered when a room is created</li>
      <li style={{ marginBottom: '6px' }}>Availability: the time blocks you mark as busy within a room's date range</li>
      <li style={{ marginBottom: '6px' }}>Room activity: which room a piece of data belongs to, and basic timestamps for when a room or a response was created or last updated</li>
    </ul>

    <p>Regular Gala additionally collects, only for people who choose to use it:</p>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>Email address: used solely to send a one-time sign-in link, we do not store a password because none is used</li>
      <li style={{ marginBottom: '6px' }}>Recurring schedule data: the weekly pattern of busy hours you submit to a regular gala, plus any pauses or one-off exceptions you set</li>
    </ul>
    <p>We do not collect your phone number, government ID, precise location, or any payment information anywhere in the app, because no part of Kelan Tayo uses these.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>3. How Your Information Is Used</h3>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>To show your submitted availability to other members of the same room or regular gala</li>
      <li style={{ marginBottom: '6px' }}>To calculate overlapping free time and generate the best-match and backup date options</li>
      <li style={{ marginBottom: '6px' }}>To let a room's creator, or a regular gala's owner, confirm a final date or recurring schedule, and display that confirmation to everyone involved</li>
      <li style={{ marginBottom: '6px' }}>For Regular Gala only, your email is used to send a magic sign-in link and to recognize you across sessions so your recurring schedule persists week to week</li>
    </ul>
    <p>Your information is only ever used within the room or gala it was submitted to. It is not used for advertising, profiling, or shared between rooms or galas.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>4. How Requests Are Handled</h3>
    <p>Room and plan creation now goes through a secure backend layer before reaching our database, rather than your browser writing to the database directly. This lets us verify that a request is genuine before it's stored, and is part of how we keep the app usable for real people rather than automated traffic. Your submitted data itself, display name, availability, plan details, is unaffected by this and is handled exactly as described elsewhere in this policy.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>5. Where Your Information Is Stored</h3>
    <p>All data is stored in a hosted database (Supabase), not in your browser alone, so that everyone in a room or gala can see the same shared information regardless of device. Access to a room requires that room's specific link or code. Access to a regular gala additionally requires a verified sign-in. Rooms and galas are not listed, searchable, or browsable by anyone who doesn't already have access.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>6. Automated Abuse Protection</h3>
    <p>To keep the app usable and to prevent large-scale automated abuse (such as bulk fake room creation by bots), Kelan Tayo uses standard technical safeguards, including server-side request validation and hidden form fields designed to detect non-human submissions. These measures only evaluate whether a submission looks automated, they do not collect any additional personal information about you. Content identified as spam or automated abuse may be reviewed and removed at our discretion, without prior notice, as part of keeping the platform usable for real users.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>7. How Long Data Is Kept</h3>
    <p>Room and gala data is kept for as long as it remains active or useful for reference. Since the base app has no accounts, there's no personal profile tied to your data beyond what you submitted inside a specific room. For Regular Gala, your profile persists as long as you continue using that feature. If you'd like your data removed, whether a room, a gala, or your Regular Gala profile, you can request this using the contact information below.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>8. Who Can See Your Information</h3>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>Other members of the same room or gala can see your display name and the availability you submitted</li>
      <li style={{ marginBottom: '6px' }}>A room's creator, or a regular gala's owner, can additionally see confirm, unlock, and (for galas) pause controls, but does not receive any information beyond what other members already see</li>
      <li style={{ marginBottom: '6px' }}>Nobody outside a room or gala, including other Kelan Tayo users elsewhere on the app, can see that room's or gala's data</li>
    </ul>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>9. Cookies and Local Storage</h3>
    <p>Kelan Tayo may use minimal local browser storage to remember which room or gala you're currently viewing, so the app loads your correct view when you return to a link. For Regular Gala, a session token is stored locally after you sign in via magic link, so you don't need to sign in again on the same device until the session expires. None of this is used for tracking or advertising.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>10. Children's Privacy</h3>
    <p>Kelan Tayo is not directed at children and does not knowingly collect information from anyone below the applicable age of digital consent in their region. The base app requires no personal identifying information beyond what a user chooses to type. Regular Gala requires an email address and is intended for general audiences.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>11. Changes to This Policy</h3>
    <p>This policy may be updated as the app changes. The version number and last updated date at the top of this document reflect the most current version. Past updates are summarized on the app's changelog page.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>12. Contact</h3>
    <p>Questions about this policy, or a request to remove room, gala, or profile data, can be sent to the app's creator, Wrenier, through the contact details provided with the app.</p>
  </>
);

const TermsContent = () => (
  <>
    <p style={{ color: 'var(--cream-muted)', marginBottom: '16px' }}>Last updated: September 20, 2026 &middot; Version 1.3.2</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>1. Acceptance of These Terms</h3>
    <p>By creating or joining a room, or by using Regular Gala, you agree to these terms. If you do not agree, please do not use the app.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>2. What Kelan Tayo Does</h3>
    <p>Kelan Tayo helps a group of people find a date and time when most or all of them are free, based on availability that each member submits. The base app handles one-off plans within a chosen date range. Regular Gala is a separate, optional feature for groups who want a recurring weekly schedule instead.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>3. No Account Required for the Base App</h3>
    <p>The base app does not require you to create an account, provide a password, or verify your identity. Access to a room is based only on having that room's link or code. Because of this, Kelan Tayo has no reliable way to verify who is actually using a room, and you are responsible for only sharing a room's link or code with people you intend to include in that plan.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>4. Regular Gala and Sign-In</h3>
    <p>Regular Gala requires a lightweight sign-in using a one-time email link, no password is created or stored. This sign-in exists only to let the app recognize you across weeks for recurring schedules, and does not apply anywhere else in the app. You're responsible for the security of the email account you use to sign in.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>5. Room and Gala Creators</h3>
    <p>The person who creates a room, or a regular gala, is recorded as its creator or owner. Only that person can confirm a final date or recurring schedule, or unlock one to change it. Kelan Tayo is not responsible for disputes between members over which date or schedule should be confirmed, that decision is left to the group.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>6. Acceptable Use</h3>
    <p>When using Kelan Tayo, you agree not to:</p>
    <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
      <li style={{ marginBottom: '6px' }}>Use the app for any unlawful purpose</li>
      <li style={{ marginBottom: '6px' }}>Enter content in a plan name, display name, or any other field that is abusive, harassing, or intended to harm another person</li>
      <li style={{ marginBottom: '6px' }}>Attempt to access a room or gala you were not given the link, code, or sign-in access for</li>
      <li style={{ marginBottom: '6px' }}>Use bots, scripts, or other automated means to create rooms, accounts, or submissions, or to otherwise interact with the app outside of normal human use</li>
      <li style={{ marginBottom: '6px' }}>Attempt to disrupt, overload, circumvent security measures on, or interfere with the app's normal operation</li>
    </ul>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>7. Automated Abuse and Content Removal</h3>
    <p>Kelan Tayo uses technical safeguards to detect and block non-human or bulk automated activity. Content identified as spam, abusive, or created through automated means may be removed at any time, without prior notice, to keep the app usable for genuine users. This may include bulk removal of large volumes of data identified as part of a coordinated automated attack.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>8. Accuracy of Information</h3>
    <p>Kelan Tayo relies on the availability members choose to submit. The app does not verify that submitted availability is accurate. Any date or recurring schedule confirmed through the app is only as reliable as the information members chose to enter.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>9. No Warranty</h3>
    <p>Kelan Tayo is provided as is, without warranties of any kind, whether express or implied. We do not guarantee that the app will be available at all times, free of errors, or free of interruptions.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>10. Limitation of Liability</h3>
    <p>To the fullest extent permitted by law, Kelan Tayo and its creator are not liable for any indirect, incidental, or consequential damages arising from your use of the app, including missed plans, scheduling conflicts, or disputes between members.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>11. Data and Content</h3>
    <p>Details on what information is collected and how it's used are covered in the Privacy Policy. By using Kelan Tayo, you also agree to that policy.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>12. Termination or Removal</h3>
    <p>Rooms, galas, or accounts found to violate the acceptable use section of these terms may be removed without notice.</p>

    <h3 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold)' }}>13. Changes to These Terms</h3>
    <p>These terms may be updated as the app changes. The version number and last updated date at the top of this document reflect the most current version. Continued use of Kelan Tayo after changes are posted means you accept the updated terms. A summary of major updates is available on the app's changelog page.</p>
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
