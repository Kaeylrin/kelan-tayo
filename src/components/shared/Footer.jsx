import React from 'react';
import { Link } from 'react-router-dom';

export function Footer({ onOpenLegal }) {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-links">
          <Link to="/changelog" className="footer-link">Changelog</Link>
          <button type="button" onClick={() => onOpenLegal('privacy')}>Privacy</button>
          <button type="button" onClick={() => onOpenLegal('terms')}>Terms</button>
          <span className="footer-version">v1.3.2</span>
        </div>
        <div className="footer-copy">
          Created by Wrenier
          <svg className="heart-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="heart icon">
            <path d="M12 21s-6.716-4.35-9.428-8.06C.86 10.42 1.2 7.2 3.6 5.4c2.1-1.58 4.9-1.1 6.4.9l2 2.6 2-2.6c1.5-2 4.3-2.48 6.4-.9 2.4 1.8 2.74 5.02 1.03 7.54C18.716 16.65 12 21 12 21z"/>
          </svg>
          <span className="footer-dot">&middot;</span>
          Copyright &copy; 2026. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
