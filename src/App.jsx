import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Pages
import { MarketingLandingPage } from './pages/MarketingLandingPage.jsx';
import { CreatePage } from './pages/CreatePage.jsx';
import { RoomPage } from './pages/RoomPage.jsx';
import { GalaLandingPage } from './pages/GalaLandingPage.jsx';
import { GalaCallbackPage } from './pages/GalaCallbackPage.jsx';
import { GalaDashboardPage } from './pages/GalaDashboardPage.jsx';
import { GalaRoomPage } from './pages/GalaRoomPage.jsx';
import { ChangelogPage } from './pages/ChangelogPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';

import './styles/App.css';

function AnimatedRoutes() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut');
      setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 150);
    }
  }, [location, displayLocation]);

  return (
    <div className={`page-transition ${transitionStage}`}>
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
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
