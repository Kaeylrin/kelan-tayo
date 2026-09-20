import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition.js';

/**
 * Navbar for /gala/* routes.
 * Matches the reference design: logo | gala-badge | Create a plan CTA
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span className="gala-badge">Regular Gala</span>
          {rightSlot || (
            <Link to="/create" className="nav-cta">
              Create a plan
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
