import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NavMenu } from './NavMenu.jsx';

/**
 * Navbar — Always Pill
 *
 * Props:
 *  isRoomPage     — true on /room/:code → shows Mark Schedule / Dashboard tabs
 *  activeTab / setActiveTab — only used when isRoomPage=true
 *  onLeaveRoom    — async leave callback (room page only)
 *
 * On mobile the links/tabs collapse into a hamburger menu (see NavMenu).
 *
 * Scroll behavior:
 *  scroll = 0   → full-width pill (same as the current app nav)
 *  scroll > 80  → shrinks to centered floating pill (narrower, backdrop blur)
 */
export function Navbar({ isRoomPage = false, activeTab, setActiveTab, onLeaveRoom }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // Already on landing page — smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`floating-nav-wrapper ${scrolled ? 'scrolled' : ''}`}>
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

        <NavMenu>
          {!isRoomPage && (
            <>
              {/* Context-aware links: hide the one you're already on */}
              {location.pathname !== '/gala' && (
                <Link to="/gala" className="nav-link-secondary">
                  Regular Gala
                </Link>
              )}
              {location.pathname !== '/create' && (
                <Link to="/create" className="nav-cta">
                  Create a plan
                </Link>
              )}
            </>
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
                  className="tab-btn tab-btn-leave"
                  onClick={onLeaveRoom}
                  type="button"
                >
                  Leave
                </button>
              )}
            </div>
          )}
        </NavMenu>
      </nav>
    </div>
  );
}
