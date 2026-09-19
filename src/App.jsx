import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// Pages
import { MarketingLandingPage } from './pages/MarketingLandingPage.jsx';
import { CreatePage } from './pages/CreatePage.jsx';
import { RoomPage } from './pages/RoomPage.jsx';
import { GalaLandingPage } from './pages/GalaLandingPage.jsx';
import { GalaCallbackPage } from './pages/GalaCallbackPage.jsx';
import { GalaDashboardPage } from './pages/GalaDashboardPage.jsx';
import { GalaRoomPage } from './pages/GalaRoomPage.jsx';

import './styles/App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketingLandingPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/room/:code" element={<RoomPage />} />
        <Route path="/gala" element={<GalaLandingPage />} />
        <Route path="/gala/callback" element={<GalaCallbackPage />} />
        <Route path="/gala/dashboard" element={<GalaDashboardPage />} />
        <Route path="/gala/:galaId" element={<GalaRoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}
