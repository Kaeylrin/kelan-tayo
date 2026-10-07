// Fades out the first-load splash from index.html once the app has mounted
// and the fonts are ready (capped so a slow font never holds the page),
// keeping it up for a minimum time so it doesn't just flash.

const MIN_VISIBLE_MS = 550;
const FONT_WAIT_CAP_MS = 1800;

let started = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function hideSplash() {
  if (started) return;
  started = true;

  const remaining = Math.max(0, MIN_VISIBLE_MS - performance.now());
  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  Promise.race([fontsReady, wait(FONT_WAIT_CAP_MS)])
    .then(() => wait(remaining))
    .then(() => {
      // Entrance animations are held until this class is set (see App.css).
      document.documentElement.classList.add('is-ready');
      const splash = document.getElementById('splash');
      if (!splash) return;
      splash.classList.add('is-leaving');
      const remove = () => splash.remove();
      splash.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 1000);
    });
}
