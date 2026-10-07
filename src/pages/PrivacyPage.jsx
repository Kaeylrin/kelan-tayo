import { Navbar } from '../components/shared/Navbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="legal-main">
        <article className="legal-card">
          <h1 className="display">Privacy Policy</h1>
          <p className="legal-updated">Last updated: October 7, 2026 &middot; Version 1.5.0</p>

          <h3>1. What This App Is</h3>
          <p>Kelan Tayo is a group scheduling tool with two parts. The base app lets a group create a shared plan, mark when they're free within a date range, and agree on a date to meet up, no account needed. Regular Gala is a separate, optional feature for groups who want a recurring weekly schedule instead of a one-off plan, and asks for an email to save your spot, no password involved. This policy covers both.</p>

          <h3>2. Information We Collect</h3>
          <p>The base app collects only what's needed for a room to function:</p>
          <ul>
            <li>Display name: the name you type when you join a room, can be anything, doesn't need to be your real name</li>
            <li>Plan details: the plan name, date range, and preferred hours entered when a room is created</li>
            <li>Availability: the time blocks you mark as busy within a room's date range</li>
            <li>Room activity: which room a piece of data belongs to, and basic timestamps for when a room or a response was created or last updated</li>
          </ul>

          <p>Regular Gala additionally collects, only for people who choose to use it:</p>
          <ul>
            <li>Email address: used solely to send the one-time "Save your spot" link, we do not store a password because none is used</li>
            <li>Recurring schedule data: the weekly pattern of busy hours you submit to a regular gala, plus any pauses or one-off exceptions you set</li>
          </ul>
          <p>We do not collect your phone number, government ID, precise location, or any payment information anywhere in the app, because no part of Kelan Tayo uses these.</p>

          <h3>3. How Your Information Is Used</h3>
          <ul>
            <li>To show your submitted availability to other members of the same room or regular gala</li>
            <li>To calculate overlapping free time and generate the best-match and backup date options</li>
            <li>To let a room's creator, or a regular gala's owner, confirm a final date or recurring schedule, and display that confirmation to everyone involved</li>
            <li>For Regular Gala only, your email is used to send your "Save your spot" link and to recognize you across visits so your recurring schedule persists week to week</li>
          </ul>
          <p>Your information is only ever used within the room or gala it was submitted to. It is not used for advertising, profiling, or shared between rooms or galas.</p>

          <h3>4. How Requests Are Handled</h3>
          <p>Every change to a room, creating it, joining it, saving availability, confirming or unlocking a date, and leaving, and everything in Regular Gala, including reading a gala, goes through a secure backend layer before reaching our database, rather than your browser writing to the database directly. This lets us verify that a request is genuine before it's stored, and is part of how we keep the app usable for real people rather than automated traffic. Your submitted data itself, display name, availability, plan details, is unaffected by this and is handled exactly as described elsewhere in this policy.</p>

          <h3>5. Where Your Information Is Stored</h3>
          <p>All data is stored in a hosted database (Supabase), not in your browser alone, so that everyone in a room or gala can see the same shared information regardless of device. Access to a room requires that room's specific link or code. Access to a regular gala additionally requires a saved spot, confirmed through the email link. Rooms and galas are not listed, searchable, or browsable by anyone who doesn't already have access.</p>

          <h3>6. Automated Abuse Protection</h3>
          <p>To keep the app usable and to prevent large-scale automated abuse (such as bulk fake room creation by bots), Kelan Tayo uses standard technical safeguards, including server-side request validation, hidden form fields designed to detect non-human submissions, Cloudflare Turnstile verification, and per-device rate limits. Turnstile is provided by Cloudflare and checks browser signals to tell people and bots apart; it does not show ads or track you across sites. For rate limits we store a one-way scrambled (hashed) version of your IP address together with the type of action and a timestamp. We never store your raw IP address, and these entries are deleted after about 24 hours. These measures are used only to evaluate whether activity looks automated. Content identified as spam or automated abuse may be reviewed and removed at our discretion, without prior notice, as part of keeping the platform usable for real users.</p>

          <h3>7. How Long Data Is Kept</h3>
          <p>Room and gala data is kept for as long as it remains active or useful for reference. Since the base app has no accounts, there's no personal profile tied to your data beyond what you submitted inside a specific room. For Regular Gala, your profile persists as long as you continue using that feature. If you'd like your data removed, whether a room, a gala, or your Regular Gala profile, you can request this using the contact information below.</p>

          <h3>8. Who Can See Your Information</h3>
          <ul>
            <li>Other members of the same room or gala can see your display name and the availability you submitted. Your Regular Gala email address is never shown to other members</li>
            <li>A room's creator, or a regular gala's owner, can additionally see confirm, unlock, and (for galas) pause controls, but does not receive any information beyond what other members already see</li>
            <li>Nobody outside a room or gala, including other Kelan Tayo users elsewhere on the app, can see that room's or gala's data</li>
          </ul>

          <h3>9. Cookies and Local Storage</h3>
          <p>Kelan Tayo may use minimal local browser storage to remember which room or gala you're currently viewing, so the app loads your correct view when you return to a link. For Regular Gala, a token is stored locally after you save your spot through the email link, so you don't need to request a new link on the same device until it expires. None of this is used for tracking or advertising.</p>

          <h3>10. Children's Privacy</h3>
          <p>Kelan Tayo is not directed at children and does not knowingly collect information from anyone below the applicable age of digital consent in their region. The base app requires no personal identifying information beyond what a user chooses to type. Regular Gala requires an email address and is intended for general audiences.</p>

          <h3>11. Changes to This Policy</h3>
          <p>This policy may be updated as the app changes. The version number and last updated date at the top of this document reflect the most current version. Past updates are summarized on the app's changelog page.</p>

        </article>
      </main>
      <Footer />
    </>
  );
}
