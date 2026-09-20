import React, { useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar.jsx';
import { Footer } from '../components/shared/Footer.jsx';

export function ChangelogPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar isLandingPage={false} isRoomPage={false} />
      <main className="changelog-main">
        <div className="changelog-header">
          <h1>Kelan Tayo updates</h1>
          <p>New features and bug fixes, listed by version with the most recent notes first.</p>
        </div>

        <div className="changelog-list">
          {/* Version 1.3.0 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.3.0</h2>
              <span className="changelog-date">2026-09-20</span>
            </div>
            <div className="changelog-content">
              <div className="changelog-group">
                <span className="badge added">ADDED</span>
                <ul>
                  <li><strong>Regular Gala updates:</strong> Introduced the Regular Gala landing page and magic link email flows.</li>
                  <li><strong>Context-aware navigation:</strong> The navbar now smartly hides links to the page you are currently on.</li>
                  <li><strong>Smooth Page Transitions:</strong> Navigating between pages now fades smoothly instead of jumping.</li>
                  <li><strong>Changelog page:</strong> You're looking at it! A new timeline to track updates to Kelan Tayo.</li>
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
                  <li>Fixed an issue where database spambots were artificially inflating the live stats count on the landing page.</li>
                  <li>Resolved CSS layout glitches where floating navbars would overlap content on smaller screens.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 1.2.1 */}
          <div className="changelog-item">
            <div className="changelog-meta">
              <h2>v1.2.1</h2>
              <span className="changelog-date">2026-09-19</span>
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
              <span className="changelog-date">2026-09-15</span>
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
              <span className="changelog-date">2026-08-30</span>
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
