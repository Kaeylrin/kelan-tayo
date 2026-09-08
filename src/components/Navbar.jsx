import React from 'react';
import { useScrollPosition } from '../hooks/useScrollPosition.js';

export function Navbar({ activeTab, setActiveTab, currentRoom, onShowToast }) {
  const isScrolled = useScrollPosition();

  return (
    <div className={`floating-nav-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="floating-navbar" aria-label="Main Navigation">
        <div
          className="logo"
          onClick={() => setActiveTab('landing')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setActiveTab('landing');
          }}
        >
          kelan<span>tayo</span>
        </div>

        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'landing'}
            className={`tab-btn ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            Create
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'mark'}
            className={`tab-btn ${activeTab === 'mark' ? 'active' : ''} ${!currentRoom ? 'disabled' : ''}`}
            onClick={() => {
              if (!currentRoom) {
                onShowToast('Please create or join a plan first!');
                return;
              }
              setActiveTab('mark');
            }}
          >
            Mark schedule
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'dashboard'}
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''} ${!currentRoom ? 'disabled' : ''}`}
            onClick={() => {
              if (!currentRoom) {
                onShowToast('Please create or join a plan first!');
                return;
              }
              setActiveTab('dashboard');
            }}
          >
            Dashboard
          </button>
        </div>
      </nav>
    </div>
  );
}
