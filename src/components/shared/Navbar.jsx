import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NavMenu } from './NavMenu.jsx';
import { useScrollPosition } from '../../hooks/useScrollPosition.js';
import { scrollToTarget } from '../../utils/smoothScroll.js';

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
 * Scroll behavior: full-width pill at the top, shrinks to a centered
 * floating pill once the page scrolls.
 */
export function Navbar({ isRoomPage = false, activeTab, setActiveTab, onLeaveRoom }) {
  const scrolled = useScrollPosition();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      // Already on landing page — smooth scroll to top
      scrollToTarget(0);
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
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLogoClick(); } }}
          aria-label="Kelan Tayo home"
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
                  role="tab"
                  aria-selected={false}
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
