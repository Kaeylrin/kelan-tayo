import { Link, useNavigate } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition.js';
import { NavMenu } from '../shared/NavMenu.jsx';

/**
 * Navbar for /gala/* routes.
 * Shows: logo | Create a plan CTA (no "Regular Gala" since we're already here)
 */
export function GalaNavbar({ rightSlot }) {
  const isScrolled = useScrollPosition();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
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
            if (e.key === 'Enter' || e.key === ' ') handleLogoClick();
          }}
          title="Back to Kelan Tayo home"
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
