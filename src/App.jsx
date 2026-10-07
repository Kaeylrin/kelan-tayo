import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';

import { MarketingLandingPage } from './pages/MarketingLandingPage.jsx';
import { initSmoothScroll, scrollToTarget, scrollToTop } from './utils/smoothScroll.js';

// Everything except the landing page is split into its own chunk.
const pageLoaders = {
  create: () => import('./pages/CreatePage.jsx').then((m) => ({ default: m.CreatePage })),
  room: () => import('./pages/RoomPage.jsx').then((m) => ({ default: m.RoomPage })),
  galaLanding: () => import('./pages/GalaLandingPage.jsx').then((m) => ({ default: m.GalaLandingPage })),
  galaCallback: () => import('./pages/GalaCallbackPage.jsx').then((m) => ({ default: m.GalaCallbackPage })),
  galaDashboard: () => import('./pages/GalaDashboardPage.jsx').then((m) => ({ default: m.GalaDashboardPage })),
  galaRoom: () => import('./pages/GalaRoomPage.jsx').then((m) => ({ default: m.GalaRoomPage })),
  changelog: () => import('./pages/ChangelogPage.jsx').then((m) => ({ default: m.ChangelogPage })),
  privacy: () => import('./pages/PrivacyPage.jsx'),
  terms: () => import('./pages/TermsPage.jsx'),
  notFound: () => import('./pages/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage })),
};

const CreatePage = lazy(pageLoaders.create);
const RoomPage = lazy(pageLoaders.room);
const GalaLandingPage = lazy(pageLoaders.galaLanding);
const GalaCallbackPage = lazy(pageLoaders.galaCallback);
const GalaDashboardPage = lazy(pageLoaders.galaDashboard);
const GalaRoomPage = lazy(pageLoaders.galaRoom);
const ChangelogPage = lazy(pageLoaders.changelog);
const PrivacyPage = lazy(pageLoaders.privacy);
const TermsPage = lazy(pageLoaders.terms);
const NotFoundPage = lazy(pageLoaders.notFound);

function PageFallback() {
  return (
    <div className="page-loading page-loading-full" role="status">
      <div className="loading-spinner" />
    </div>
  );
}

const PAGE_FADE_MS = 160;

// Last scroll position of each history entry, so Back/Forward land where you left off.
const scrollPositions = new Map();

/**
 * Fades the old page out, swaps routes, then fades the new page in.
 * Only opacity is animated: a transform here would turn the fixed navbar
 * into an absolutely positioned one for the duration of the animation.
 */
function AnimatedRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [stage, setStage] = useState('in');

  useEffect(() => {
    const key = displayLocation.key;
    const onScroll = () => scrollPositions.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [displayLocation.key]);

  const pathChanged = location.pathname !== displayLocation.pathname;
  if (pathChanged && stage === 'in') {
    setStage('out');
  } else if (!pathChanged && location.key !== displayLocation.key) {
    setDisplayLocation(location); // same page, new state or hash
  }

  const swap = useCallback(() => {
    setDisplayLocation(location);
    setStage('in');
    const saved = navigationType === 'POP' ? scrollPositions.get(location.key) : undefined;
    if (saved) requestAnimationFrame(() => scrollToTarget(saved, { immediate: true }));
    else scrollToTop(true);
  }, [location, navigationType]);

  // Fallback in case animationend never fires (e.g. background tab).
  useEffect(() => {
    if (stage !== 'out') return;
    const timer = setTimeout(swap, PAGE_FADE_MS + 200);
    return () => clearTimeout(timer);
  }, [stage, swap]);

  return (
    <div
      className={`page-transition page-${stage}`}
      onAnimationEnd={(e) => { if (e.target === e.currentTarget && stage === 'out') swap(); }}
    >
      <Suspense fallback={<PageFallback />}>
        <Routes location={displayLocation}>
          <Route path="/" element={<MarketingLandingPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/room/:code" element={<RoomPage />} />
          <Route path="/gala" element={<GalaLandingPage />} />
          <Route path="/gala/callback" element={<GalaCallbackPage />} />
          <Route path="/gala/dashboard" element={<GalaDashboardPage />} />
          <Route path="/gala/:galaId" element={<GalaRoomPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initSmoothScroll();
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    // Warm up the base-app pages once idle, so navigation feels instant. Regular Gala
    // pages are left out: base pages stay unaware of the email-link code (Regular Gala guide §4).
    const basePages = ['create', 'room', 'changelog', 'privacy', 'terms', 'notFound'];
    const preload = () => basePages.forEach((name) => pageLoaders[name]().catch(() => {}));
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const handle = idle(preload);
    return () => cancel(handle);
  }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
