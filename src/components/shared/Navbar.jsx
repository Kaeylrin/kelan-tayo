import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`floating-nav-wrapper ${scrolled ? 'scrolled' : ''}`}>
      <nav className="floating-navbar" aria-label="Main Navigation">
        {/* Logo — always links to / */}
        <div
          className="logo"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/'); }}
        >
          kelan<span>tayo</span>
        </div>

        {/* Right side: CTA on landing, tabs on room, nothing on /create */}
        {isLandingPage && (
          <Link to="/create" className="nav-cta">
            Create a plan
          </Link>
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
