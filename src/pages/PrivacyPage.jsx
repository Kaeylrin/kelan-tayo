import React, { useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-grid-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, marginTop: '120px', padding: '0 20px 60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', background: 'var(--card-bg)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h1 className="display" style={{ marginBottom: '8px', color: 'var(--cream)' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--cream-muted)', marginBottom: '32px' }}>Last updated: September 20, 2026 &middot; Version 1.3.2</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>1. What This App Is</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Kelan Tayo is a group scheduling tool with two parts. The base app lets a group create a shared plan, mark when they're free within a date range, and agree on a date to meet up, no account needed. Regular Gala is a separate, optional feature for groups who want a recurring weekly schedule instead of a one-off plan, and requires a lightweight, passwordless sign-in. This policy covers both.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>2. Information We Collect</h3>
          <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>The base app collects only what's needed for a room to function:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '24px', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}>Display name: the name you type when you join a room, can be anything, doesn't need to be your real name</li>
            <li style={{ marginBottom: '8px' }}>Plan details: the plan name, date range, and preferred hours entered when a room is created</li>
            <li style={{ marginBottom: '8px' }}>Availability: the time blocks you mark as busy within a room's date range</li>
            <li style={{ marginBottom: '8px' }}>Room activity: which room a piece of data belongs to, and basic timestamps for when a room or a response was created or last updated</li>
          </ul>

          <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>Regular Gala additionally collects, only for people who choose to use it:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '24px', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}>Email address: used solely to send a one-time sign-in link, we do not store a password because none is used</li>
            <li style={{ marginBottom: '8px' }}>Recurring schedule data: the weekly pattern of busy hours you submit to a regular gala, plus any pauses or one-off exceptions you set</li>
          </ul>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>We do not collect your phone number, government ID, precise location, or any payment information anywhere in the app, because no part of Kelan Tayo uses these.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>3. How Your Information Is Used</h3>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}>To show your submitted availability to other members of the same room or regular gala</li>
            <li style={{ marginBottom: '8px' }}>To calculate overlapping free time and generate the best-match and backup date options</li>
            <li style={{ marginBottom: '8px' }}>To let a room's creator, or a regular gala's owner, confirm a final date or recurring schedule, and display that confirmation to everyone involved</li>
            <li style={{ marginBottom: '8px' }}>For Regular Gala only, your email is used to send a magic sign-in link and to recognize you across sessions so your recurring schedule persists week to week</li>
          </ul>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Your information is only ever used within the room or gala it was submitted to. It is not used for advertising, profiling, or shared between rooms or galas.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>4. How Requests Are Handled</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Room and plan creation now goes through a secure backend layer before reaching our database, rather than your browser writing to the database directly. This lets us verify that a request is genuine before it's stored, and is part of how we keep the app usable for real people rather than automated traffic. Your submitted data itself, display name, availability, plan details, is unaffected by this and is handled exactly as described elsewhere in this policy.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>5. Where Your Information Is Stored</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>All data is stored in a hosted database (Supabase), not in your browser alone, so that everyone in a room or gala can see the same shared information regardless of device. Access to a room requires that room's specific link or code. Access to a regular gala additionally requires a verified sign-in. Rooms and galas are not listed, searchable, or browsable by anyone who doesn't already have access.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>6. Automated Abuse Protection</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>To keep the app usable and to prevent large-scale automated abuse (such as bulk fake room creation by bots), Kelan Tayo uses standard technical safeguards, including server-side request validation and hidden form fields designed to detect non-human submissions. These measures only evaluate whether a submission looks automated, they do not collect any additional personal information about you. Content identified as spam or automated abuse may be reviewed and removed at our discretion, without prior notice, as part of keeping the platform usable for real users.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>7. How Long Data Is Kept</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Room and gala data is kept for as long as it remains active or useful for reference. Since the base app has no accounts, there's no personal profile tied to your data beyond what you submitted inside a specific room. For Regular Gala, your profile persists as long as you continue using that feature. If you'd like your data removed, whether a room, a gala, or your Regular Gala profile, you can request this using the contact information below.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>8. Who Can See Your Information</h3>
          <ul style={{ paddingLeft: '24px', marginBottom: '24px', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}>Other members of the same room or gala can see your display name and the availability you submitted</li>
            <li style={{ marginBottom: '8px' }}>A room's creator, or a regular gala's owner, can additionally see confirm, unlock, and (for galas) pause controls, but does not receive any information beyond what other members already see</li>
            <li style={{ marginBottom: '8px' }}>Nobody outside a room or gala, including other Kelan Tayo users elsewhere on the app, can see that room's or gala's data</li>
          </ul>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>9. Cookies and Local Storage</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Kelan Tayo may use minimal local browser storage to remember which room or gala you're currently viewing, so the app loads your correct view when you return to a link. For Regular Gala, a session token is stored locally after you sign in via magic link, so you don't need to sign in again on the same device until the session expires. None of this is used for tracking or advertising.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>10. Children's Privacy</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Kelan Tayo is not directed at children and does not knowingly collect information from anyone below the applicable age of digital consent in their region. The base app requires no personal identifying information beyond what a user chooses to type. Regular Gala requires an email address and is intended for general audiences.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>11. Changes to This Policy</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>This policy may be updated as the app changes. The version number and last updated date at the top of this document reflect the most current version. Past updates are summarized on the app's changelog page.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>12. Contact</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Questions about this policy, or a request to remove room, gala, or profile data, can be sent to the app's creator, Wrenier, through the contact details provided with the app.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
