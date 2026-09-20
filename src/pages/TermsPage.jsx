import React, { useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-grid-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, marginTop: '120px', padding: '0 20px 60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', background: 'var(--card-bg)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h1 className="display" style={{ marginBottom: '8px', color: 'var(--cream)' }}>Terms of Service</h1>
          <p style={{ color: 'var(--cream-muted)', marginBottom: '32px' }}>Last updated: September 20, 2026 &middot; Version 1.3.2</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>1. Acceptance of These Terms</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>By creating or joining a room, or by using Regular Gala, you agree to these terms. If you do not agree, please do not use the app.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>2. What Kelan Tayo Does</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Kelan Tayo helps a group of people find a date and time when most or all of them are free, based on availability that each member submits. The base app handles one-off plans within a chosen date range. Regular Gala is a separate, optional feature for groups who want a recurring weekly schedule instead.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>3. No Account Required for the Base App</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>The base app does not require you to create an account, provide a password, or verify your identity. Access to a room is based only on having that room's link or code. Because of this, Kelan Tayo has no reliable way to verify who is actually using a room, and you are responsible for only sharing a room's link or code with people you intend to include in that plan.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>4. Regular Gala and Sign-In</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Regular Gala requires a lightweight sign-in using a one-time email link, no password is created or stored. This sign-in exists only to let the app recognize you across weeks for recurring schedules, and does not apply anywhere else in the app. You're responsible for the security of the email account you use to sign in.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>5. Room and Gala Creators</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>The person who creates a room, or a regular gala, is recorded as its creator or owner. Only that person can confirm a final date or recurring schedule, or unlock one to change it. Kelan Tayo is not responsible for disputes between members over which date or schedule should be confirmed, that decision is left to the group.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>6. Acceptable Use</h3>
          <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>When using Kelan Tayo, you agree not to:</p>
          <ul style={{ paddingLeft: '24px', marginBottom: '24px', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}>Use the app for any unlawful purpose</li>
            <li style={{ marginBottom: '8px' }}>Enter content in a plan name, display name, or any other field that is abusive, harassing, or intended to harm another person</li>
            <li style={{ marginBottom: '8px' }}>Attempt to access a room or gala you were not given the link, code, or sign-in access for</li>
            <li style={{ marginBottom: '8px' }}>Use bots, scripts, or other automated means to create rooms, accounts, or submissions, or to otherwise interact with the app outside of normal human use</li>
            <li style={{ marginBottom: '8px' }}>Attempt to disrupt, overload, circumvent security measures on, or interfere with the app's normal operation</li>
          </ul>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>7. Automated Abuse and Content Removal</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Kelan Tayo uses technical safeguards to detect and block non-human or bulk automated activity. Content identified as spam, abusive, or created through automated means may be removed at any time, without prior notice, to keep the app usable for genuine users. This may include bulk removal of large volumes of data identified as part of a coordinated automated attack.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>8. Accuracy of Information</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Kelan Tayo relies on the availability members choose to submit. The app does not verify that submitted availability is accurate. Any date or recurring schedule confirmed through the app is only as reliable as the information members chose to enter.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>9. No Warranty</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Kelan Tayo is provided as is, without warranties of any kind, whether express or implied. We do not guarantee that the app will be available at all times, free of errors, or free of interruptions.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>10. Limitation of Liability</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>To the fullest extent permitted by law, Kelan Tayo and its creator are not liable for any indirect, incidental, or consequential damages arising from your use of the app, including missed plans, scheduling conflicts, or disputes between members.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>11. Data and Content</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Details on what information is collected and how it's used are covered in the Privacy Policy. By using Kelan Tayo, you also agree to that policy.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>12. Termination or Removal</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>Rooms, galas, or accounts found to violate the acceptable use section of these terms may be removed without notice.</p>

          <h3 style={{ marginTop: '32px', marginBottom: '12px', color: 'var(--gold)', fontSize: '1.2rem' }}>13. Changes to These Terms</h3>
          <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>These terms may be updated as the app changes. The version number and last updated date at the top of this document reflect the most current version. Continued use of Kelan Tayo after changes are posted means you accept the updated terms. A summary of major updates is available on the app's changelog page.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
