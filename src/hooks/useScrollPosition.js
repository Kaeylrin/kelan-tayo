import { useState, useEffect } from 'react';

/**
 * True once the page has scrolled past ~80px (landing guide §5).
 * Hysteresis (80 down / 60 up) stops the pill flickering at the edge.
 */
export function useScrollPosition(threshold = 80) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Apply a hysteresis threshold to prevent edge vibration/twitching at limits
          setIsScrolled((prev) => {
            if (!prev && scrollY > threshold) return true;
            if (prev && scrollY < threshold - 20) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
