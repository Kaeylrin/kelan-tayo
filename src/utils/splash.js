// Fades out the first-load splash from index.html as soon as the first page
// has actually rendered and the fonts are ready (capped so a slow font never
// holds the page). There is no minimum time: on a fast or cached load the
// splash clears before its logo ever appears (the logo is delayed in CSS).

const FONT_WAIT_CAP_MS = 1500;

let started = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function hideSplash() {
  if (started) return;
  started = true;

  const fontsReady = document.fonts?.ready ?? Promise.resolve();

  Promise.race([fontsReady, wait(FONT_WAIT_CAP_MS)]).then(() => {
    // Entrance animations are held until this class is set (see App.css).
    document.documentElement.classList.add('is-ready');
    const splash = document.getElementById('splash');
    if (!splash) return;
    splash.classList.add('is-leaving');
    const remove = () => splash.remove();
    splash.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 800);
  });
}

