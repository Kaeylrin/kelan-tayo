import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition.js';
import { NavMenu } from '../shared/NavMenu.jsx';
import { scrollToTarget } from '../../utils/smoothScroll.js';

/**
 * Navbar for /gala/* routes.
 * Shows: logo | Create a plan CTA (or a page-specific action).
 */
export function GalaNavbar({ rightSlot }) {
  const isScrolled = useScrollPosition();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') scrollToTarget(0);
    else navigate('/');
  };

  return (
    <div className={`floating-nav-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="floating-navbar" aria-label="Regular Gala Navigation">
        <div
          className="logo"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLogoClick(); }
          }}
          title="Back to Kelan Tayo home"
          aria-label="Kelan Tayo home"
        >
          kelan<span>tayo</span>
        </div>

        <NavMenu>
          {rightSlot || (
            <Link to="/create" className="nav-cta">
              Create a plan
            </Link>
          )}
        </NavMenu>
      </nav>
    </div>
  );
}
