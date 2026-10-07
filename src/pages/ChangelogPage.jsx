import { Navbar } from '../components/shared/Navbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';

export function ChangelogPage() {
  return (
    <>
      <Navbar />
      <main className="changelog-main">
        <div className="changelog-header">
          <h1>
            <span style={{ color: 'white' }}>Kelan</span>
            <span style={{ color: 'var(--gold)' }}>Tayo</span> Updates
          </h1>
          <p>New features and bug fixes, listed by version with the most recent notes first.</p>
        </div>

        <div className="changelog-list">
          {/* Version 1.5.0 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.5.0</h2>
              <span className="changelog-date">October 7, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge added">ADDED</span>
                <ul>
                  <li><strong>Regular Gala, fully working:</strong> Create a gala, invite your crew with a link, mark your usual week, see the best recurring times, and confirm one or more days as the regular schedule.</li>
                  <li><strong>Upcoming sessions:</strong> Confirmed galas show the next few dates, with skipped days, extra sessions and who's out already applied.</li>
                  <li><strong>Exceptions for everyone:</strong> The owner can skip or add a session for the whole crew, and any member can mark a date they can't make.</li>
                  <li><strong>Pause controls:</strong> Pause just yourself or the whole gala without losing any schedules.</li>
                  <li><strong>Invite links:</strong> Opening a gala link while signed out takes you through "Save your spot" and straight back to the gala.</li>
                  <li><strong>Smooth scrolling and motion:</strong> Mouse-wheel scrolling now glides, pages fade between each other, and sections ease in as you scroll. Everything respects your device's reduced-motion setting.</li>
                  <li>A proper 404 page for broken links, and a leave confirmation before you leave a plan.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge changed">CHANGED</span>
                <ul>
                  <li><strong>Locked-down Regular Gala:</strong> Every gala read and write now goes through our secure server with your signed-in session. Other members see your display name, never your email.</li>
                  <li><strong>Faster loading:</strong> Pages now load on demand, the landing page ships less than half the JavaScript it used to, and screenshots and photos are about 80% smaller.</li>
                  <li>Added stricter browser security headers (Content Security Policy, HSTS).</li>
                  <li>Restyled the Privacy and Terms pages, the Regular Gala landing page and every Regular Gala screen.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge fixed">FIXED</span>
                <ul>
                  <li>Fixed creating and listing Regular Galas, which always failed before.</li>
                  <li>Fixed locked-in plans saving afternoon and evening times as morning times (e.g. 8 PM saved as 8 AM).</li>
                  <li>Fixed two members with the same name being merged into one on the dashboard.</li>
                  <li>Fixed the "responded" counter always showing 0 and the share box showing a broken link.</li>
                  <li>Schedule grids now open at 8 AM instead of scrolling past it.</li>
                  <li>Fixed a large empty gap at the top of the Regular Gala page and the missing card background on Privacy and Terms.</li>
                  <li>Fixed the "How it works" steps alternating in the wrong order.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.4.0 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.4.0</h2>
              <span className="changelog-date">October 4, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge added">ADDED</span>
                <ul>
                  <li><strong>Mobile menu:</strong> On phones, the navbar links and room tabs now tuck into an animated hamburger menu that opens as a dropdown card and closes when you tap a link, tap outside, or press Escape.</li>
                  <li><strong>Bot protection on joining:</strong> Joining a room now goes through the same invisible Cloudflare Turnstile check as creating one.</li>
                  <li><strong>Rate limits and room caps:</strong> Each device can only create or join a limited number of rooms per hour, and a room can have at most 50 members.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge changed">CHANGED</span>
                <ul>
                  <li><strong>Locked-down database:</strong> Every change to a room (creating, joining, saving availability, confirming, unlocking and leaving) now goes through our secure server. Browsers can only read room data, so bots can no longer write to the database directly.</li>
                  <li>Room codes are now generated on the server, and creating a plan is a single request instead of three.</li>
                  <li>Saving your schedule is now one request instead of one per day, so it is much faster on long date ranges.</li>
                  <li>Plan names and display names are cleaned of invisible characters and limited to 60 and 40 characters.</li>
                  <li>Landing page stats now come straight from the database, counting only rooms that look like real groups.</li>
                  <li>Updated the Privacy Policy to describe Cloudflare Turnstile and the hashed-IP rate limits.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge fixed">FIXED</span>
                <ul>
                  <li>Fixed the Create page crashing on load.</li>
                  <li>Fixed refreshing or opening a shared room link directly showing a 404 page.</li>
                  <li>The bot check no longer stays hidden when Cloudflare needs you to click it, so real users are no longer silently blocked.</li>
                  <li>Removed old debugging scripts and unused files from the project.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.3.2 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.3.2</h2>
              <span className="changelog-date">September 20, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge changed">CHANGED</span>
                <ul>
                  <li>Updated Privacy Policy and Terms of Service to reflect the new Regular Gala features and automated abuse protection measures.</li>
                  <li>Overhauled formatting in legal modals for better readability.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.3.1 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.3.1</h2>
              <span className="changelog-date">September 19, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge changed">CHANGED</span>
                <ul>
                  <li>Completely refactored the Regular Gala landing page to match the side-by-side grid layout of the Create page.</li>
                  <li>Clicking the logo inside the Regular Gala page now securely routes back to the main homepage.</li>
                  <li>Moved the Changelog link to be a dedicated button in the footer for better visibility.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge fixed">FIXED</span>
                <ul>
                  <li>Fixed a flex layout bug that caused the "for the plans you make every week" pill to stretch across the entire screen.</li>
                  <li>Fixed a page transition wrapper bug that prevented the footer from sticking to the bottom on short pages.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.3.0 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.3.0</h2>
              <span className="changelog-date">September 17, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge added">ADDED</span>
                <ul>
                  <li><strong>Regular Gala updates:</strong> Introduced the Regular Gala landing page and magic link email flows.</li>
                  <li><strong>Context-aware navigation:</strong> The navbar now smartly hides links to the page you are currently on.</li>
                  <li><strong>Smooth Page Transitions:</strong> Navigating between pages now fades smoothly instead of jumping.</li>
                  <li><strong>Changelog page:</strong> A new timeline to track updates to Kelan Tayo.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge changed">CHANGED</span>
                <ul>
                  <li>Refined floating navbar dimensions and behaviors to be fully consistent across all pages.</li>
                  <li>Replaced emoji icons on the Regular Gala page with sleek SVG line icons.</li>
                  <li>Restyled the "Regular Gala" navigation link to match the clean, pill-shaped secondary button design.</li>
                  <li>Increased breathing room in page hero sections to prevent overlaps with the floating navbar.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge fixed">FIXED</span>
                <ul>
                  <li>Implemented aggressive filtering on the live stats to ignore automated database spam and only show genuine usage numbers.</li>
                  <li>Resolved CSS layout glitches where floating navbars would overlap content on smaller screens.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.2.1 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.2.1</h2>
              <span className="changelog-date">September 15, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge added">ADDED</span>
                <ul>
                  <li><strong>Landing Page:</strong> Launched the brand new marketing landing page explaining how Kelan Tayo works.</li>
                  <li><strong>Preferred Hours:</strong> Added presets for Morning to Night, Noon to Midnight, Anytime, and Custom hours when creating a plan.</li>
                </ul>
              </div>
              <div className="changelog-group">
                <span className="badge changed">CHANGED</span>
                <ul>
                  <li>Moved the room creation form into its own dedicated <code>/create</code> route.</li>
                  <li>"Best Match" on the dashboard now strictly obeys the preferred time window set by the creator.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.0.12 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.0.12</h2>
              <span className="changelog-date">September 13, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge fixed">FIXED</span>
                <ul>
                  <li>Fixed bugs with landing count, real-time locking, state reset, and leaving plans.</li>
                  <li>Fixed blank room code display issues.</li>
                  <li>Fixed mobile scrolling UX issues by introducing the scroll/draw mode toggle.</li>
                  <li>Updated name input placeholders to "Juan Dela Cruz".</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.0.0 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.0.0</h2>
              <span className="changelog-date">September 10, 2026</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge added">ADDED</span>
                <ul>
                  <li><strong>Initial Release (MVP):</strong> Find the day everyone's actually free. Stop guessing across endless group chat messages.</li>
                  <li>Create rooms, share links, drag-to-mark busy hours, and view the best matching date on the dashboard.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
