import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Navbar — Always Pill
 *
 * Props:
 *  isLandingPage  — true on /  → shows "Create a plan" CTA, no tabs
 *  isRoomPage     — true on /room/:code → shows Mark Schedule / Dashboard tabs
 *  activeTab / setActiveTab — only used when isRoomPage=true
 *  currentRoom    — used to show room name badge when in room
 *  onShowToast    — toast callback
 *  onLeaveRoom    — async leave callback (room page only)
 *
 * Scroll behavior:
 *  scroll = 0   → full-width pill (same as the current app nav)
 *  scroll > 80  → shrinks to centered floating pill (narrower, backdrop blur)
 */
export function Navbar({ isLandingPage = false, isRoomPage = false, activeTab, setActiveTab, currentRoom, onShowToast, onLeaveRoom }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLandingPage) return; // Only apply shrinking pill behavior on the landing page
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLandingPage]);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // Already on landing page — smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // Show the "Regular Gala" badge + "Create a plan" CTA on both landing and create pages
  const showNavCtas = isLandingPage || (!isRoomPage);

  return (
    <div className={`floating-nav-wrapper ${scrolled ? 'scrolled' : ''} ${!isLandingPage ? 'relative-nav' : ''}`}>
      <nav className="floating-navbar" aria-label="Main Navigation">
        {/* Logo — smooth scroll to top on landing, navigate to / elsewhere */}
        <div
          className="logo"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLogoClick(); }}
        >
          kelan<span>tayo</span>
        </div>

        {/* Right side: badge + CTA on landing & create, tabs on room */}
        {showNavCtas && !isRoomPage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link to="/gala" className="gala-badge">
              Regular Gala
            </Link>
            <Link to="/create" className="nav-cta">
              Create a plan
            </Link>
          </div>
        )}

        {isRoomPage && (
          <div className="tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'mark'}
              className={`tab-btn ${activeTab === 'mark' ? 'active' : ''}`}
              onClick={() => setActiveTab('mark')}
            >
              Mark schedule
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            {onLeaveRoom && (
              <button
                className="tab-btn"
                onClick={onLeaveRoom}
                type="button"
                style={{ color: 'var(--coral)', opacity: 0.8 }}
              >
                Leave
              </button>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
