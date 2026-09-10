import React, { useMemo, useRef, useState, useEffect } from 'react';
import { HOURS, DAY_NAMES, MONTH_NAMES } from '../constants/config.js';
import { getDatesArray, formatDateISO } from '../utils/storage.js';

export function MarkScheduleView({
  room,
  userName,
  setUserName,
  busySlots,
  setBusySlots,
  handleSaveSchedule,
  copyShareLink,
  isLocked
}) {
  const dates = useMemo(() => getDatesArray(room.startDate, room.endDate), [room.startDate, room.endDate]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragMarkMode, setDragMarkMode] = useState(true); // true = mark busy, false = mark free
  const [interactionMode, setInteractionMode] = useState('scroll'); // 'scroll' or 'draw'
  const scrollRef = useRef(null);

  // Auto-scroll to 8:00 AM on initial load
  useEffect(() => {
    if (scrollRef.current) {
      const anchor = scrollRef.current.querySelector('[data-scroll-anchor="true"]');
      if (anchor) {
        scrollRef.current.scrollTop = anchor.offsetTop - 30;
      }
    }
  }, []);

  const toggleSlot = (slotKey, markAsBusy) => {
    if (isLocked) return;
    setBusySlots(prev => {
      const next = new Set(prev);
      if (markAsBusy) next.add(slotKey);
      else next.delete(slotKey);
      return next;
    });
  };

  const handleCellMouseDown = (slotKey) => {
    if (interactionMode === 'scroll') return;
    setIsMouseDown(true);
    const currentlyBusy = busySlots.has(slotKey);
    const newMode = !currentlyBusy;
    setDragMarkMode(newMode);
    toggleSlot(slotKey, newMode);
  };

  const handleCellMouseEnter = (slotKey) => {
    if (!isMouseDown || interactionMode === 'scroll') return;
    toggleSlot(slotKey, dragMarkMode);
  };

  // Touch Drag Support for Mobile Viewports
  const handleTouchMove = (e) => {
    if (interactionMode === 'scroll') return;
    if (!isMouseDown) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.dataset && target.dataset.slot) {
      toggleSlot(target.dataset.slot, dragMarkMode);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveSchedule();
    }
  };

  const totalBusyHours = busySlots.size;
  const totalGridHours = dates.length * 24;
  const totalFreeHours = Math.max(0, totalGridHours - totalBusyHours);
  const responseCount = Object.keys(room.participants || {}).length;
  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;

  return (
    <div className="view-content mark-view-container" onKeyDown={handleFormKeyDown}>
      {/* Top Header Card */}
      <div className="mark-header-panel">
        <div className="mark-title-col">
          <div className="mark-title-badges">
            <h2 className="display mark-room-name">{room.name}</h2>
            <span className="room-code-tag">Room <b>{room.code}</b></span>
            <div className="progress-pill">{responseCount} responded</div>
          </div>
          <p className="mark-guide-text">
            Drag or click on hours when you are <strong style={{ color: 'var(--coral)' }}>busy / occupied</strong>. Unmarked times remain <strong style={{ color: 'var(--gold)' }}>free</strong>.
          </p>
        </div>

        {/* Share Link Row with inline copy */}
        <div className="share-link-box">
          <span className="share-box-label">Share with barkada:</span>
          <div className="share-input-group">
            <input
              type="text"
              readOnly
              className="share-link-input"
              value={shareUrl}
              onClick={(e) => e.target.select()}
            />
            <button className="btn-copy-action" onClick={copyShareLink} type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* User name input + Quick Action Buttons + Save Button */}
      <div className="mark-controls-panel">
        <div className="name-and-shortcuts">
          <div className="name-input-wrapper">
            <label className="field-sublabel" htmlFor="nameInput">Your Name</label>
            <input
              className="field name-input-field"
              id="nameInput"
              placeholder="e.g. Mika, Josh, Bea"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="off"
              required
              disabled={isLocked}
            />
          </div>
          <div className="preset-quick-actions" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--navy)', padding: '4px', borderRadius: '8px' }}>
              <button
                className={`btn-quick-toggle ${interactionMode === 'scroll' ? 'active' : ''}`}
                style={interactionMode === 'scroll' ? { background: 'var(--blue)', color: '#fff' } : {}}
                onClick={() => setInteractionMode('scroll')}
                type="button"
              >
                👆 Scroll
              </button>
              <button
                className={`btn-quick-toggle ${interactionMode === 'draw' ? 'active' : ''}`}
                style={interactionMode === 'draw' ? { background: 'var(--blue)', color: '#fff' } : {}}
                onClick={() => setInteractionMode('draw')}
                type="button"
              >
                🖍️ Draw
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-quick-toggle"
                type="button"
                onClick={() => setBusySlots(new Set())}
                disabled={isLocked}
              >
                Clear (All free)
              </button>
              <button
                className="btn-quick-toggle"
                type="button"
                disabled={isLocked}
                onClick={() => {
                  const all = new Set();
                  dates.forEach(d => {
                    const ds = formatDateISO(d);
                    for (let h = 0; h < 24; h++) all.add(`${ds}_${h}`);
                  });
                  setBusySlots(all);
                }}
              >
                Mark all busy
              </button>
            </div>
          </div>
        </div>

        <div className="schedule-summary-action">
          <div className="schedule-hour-stats">
            <span className="stat-pill stat-busy">{totalBusyHours}h busy</span>
            <span className="stat-pill stat-free">{totalFreeHours}h free</span>
          </div>
          {isLocked ? (
             <div style={{ color: 'var(--coral)', fontSize: '12px', fontWeight: 'bold' }}>Room is Locked</div>
          ) : (
            <button className="btn-save-schedule" onClick={handleSaveSchedule} type="button">
              Save Schedule
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-wrap">
        <div className="grid-scroll" ref={scrollRef}>
          <div
            className={`avail-grid ${interactionMode}-mode`}
            style={{ gridTemplateColumns: `60px repeat(${dates.length}, minmax(80px, 1fr))` }}
            onTouchMove={handleTouchMove}
          >
            {/* Header row */}
            <div className="grid-corner"></div>
            {dates.map((d, i) => (
              <div key={i} className="day-head">
                {DAY_NAMES[d.getDay()]}
                <span>{MONTH_NAMES[d.getMonth()]} {d.getDate()}</span>
              </div>
            ))}

            {/* 24-hour grid rows */}
            {HOURS.map((hLabel, hourIdx) => (
              <React.Fragment key={hourIdx}>
                <div className="time-label">{hLabel}</div>
                {dates.map((d, dIdx) => {
                  const slotKey = `${formatDateISO(d)}_${hourIdx}`;
                  const isBusy = busySlots.has(slotKey);
                  return (
                    <div
                      key={dIdx}
                      className={`cell ${isBusy ? 'picked' : ''}`}
                      data-slot={slotKey}
                      data-scroll-anchor={hourIdx === 8 ? 'true' : undefined}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCellMouseDown(slotKey);
                      }}
                      onMouseEnter={() => handleCellMouseEnter(slotKey)}
                      onTouchStart={() => {
                        if (interactionMode === 'scroll') return;
                        setIsMouseDown(true);
                        const newMode = !busySlots.has(slotKey);
                        setDragMarkMode(newMode);
                        toggleSlot(slotKey, newMode);
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
