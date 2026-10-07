import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// One Lenis instance for the whole app: eases mouse-wheel and trackpad
// scrolling. Touch scrolling stays native. Skipped for reduced motion.

let lenis = null;
let lockCount = 0;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll() {
  if (lenis || typeof window === 'undefined' || prefersReducedMotion()) return lenis;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.11,
    wheelMultiplier: 1,
    anchors: { offset: -96 },
  });
  return lenis;
}

/** Scrolls the page to a pixel offset or an element. */
export function scrollToTarget(target, { immediate = false, offset = 0 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset, force: true });
    return;
  }
  const behavior = immediate || prefersReducedMotion() ? 'auto' : 'smooth';
  const top = typeof target === 'number'
    ? target
    : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior });
}

export function scrollToTop(immediate = true) {
  scrollToTarget(0, { immediate });
}

/** Stops page scrolling while a dialog is open. Calls nest safely. */
export function lockScroll() {
  lockCount += 1;
  if (lockCount > 1) return;
  lenis?.stop();
  document.documentElement.classList.add('scroll-locked');
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  lenis?.start();
  document.documentElement.classList.remove('scroll-locked');
}
