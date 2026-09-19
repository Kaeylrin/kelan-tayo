import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition.js';

/**
 * Navbar used across all /gala/* routes.
 * Accepts optional isLandingPage prop (currently unused but kept for API parity).
 */
export function GalaNavbar({ rightSlot }) {
  const isScrolled = useScrollPosition();
  const navigate = useNavigate();

  return (
    <div className={`floating-nav-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="floating-navbar" aria-label="Regular Gala Navigation">
        <div
          className="logo"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/');
          }}
          title="Back to Kelan Tayo home"
        >
          kelan<span>tayo</span>
        </div>

        <div className="gala-nav-center">
          <span className="gala-nav-badge">Regular Gala</span>
        </div>

        <div className="gala-nav-right">
          {rightSlot}
        </div>
      </nav>
    </div>
  );
}
