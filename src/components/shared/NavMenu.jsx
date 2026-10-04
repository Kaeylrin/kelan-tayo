import { useState, useEffect, useRef, useId } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Right side of the floating navbar.
 * Desktop: renders the actions inline.
 * Mobile (≤768px): collapses them behind an animated hamburger button that
 * opens a dropdown card under the pill. Closes on navigation, item click,
 * Escape, or a tap outside.
 */
export function NavMenu({ children }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const location = useLocation();

  // Close whenever the route changes.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onPointer = (e) => {
      const nav = rootRef.current?.closest('nav');
      if (nav && !nav.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div className="nav-menu" ref={rootRef}>
      <div className="nav-actions">{children}</div>

      <button
        type="button"
        className={`nav-burger ${open ? 'open' : ''}`}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav-burger-line" />
        <span className="nav-burger-line" />
        <span className="nav-burger-line" />
      </button>

      <div
        id={menuId}
        className={`nav-mobile-menu ${open ? 'open' : ''}`}
        aria-hidden={!open}
        inert={!open}
        onClick={(e) => { if (e.target.closest('a, button')) setOpen(false); }}
      >
        {children}
      </div>
    </div>
  );
}
