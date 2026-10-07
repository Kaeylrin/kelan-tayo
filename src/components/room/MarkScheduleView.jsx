import { Fragment, useMemo, useRef, useEffect } from 'react';
import { HOURS, DAY_NAMES, MONTH_NAMES } from '../../constants/config.js';
import { getDatesArray, formatDateISO, scrollGridToAnchor } from '../../utils/storage.js';

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
  const drag = useRef(null); // { mark: boolean } while dragging
  const scrollRef = useRef(null);

  // Auto-scroll to 8:00 AM on initial load
  useEffect(() => { scrollGridToAnchor(scrollRef.current); }, []);

  const toggleSlot = (slotKey, markAsBusy) => {
    if (isLocked) return;
    setBusySlots(prev => {
      if (prev.has(slotKey) === markAsBusy) return prev;
      const next = new Set(prev);
      if (markAsBusy) next.add(slotKey);
      else next.delete(slotKey);
      return next;
    });
  };

  // Pointer events cover mouse, touch and pen with one code path.
  const handlePointerDown = (e, slotKey) => {
    if (isLocked || e.button !== 0) return;
    e.preventDefault();
    // Let pointerenter fire on the other cells while a finger drags.
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const mark = !busySlots.has(slotKey);
    drag.current = { mark };
    toggleSlot(slotKey, mark);
  };

  const handlePointerEnter = (slotKey) => {
    if (drag.current) toggleSlot(slotKey, drag.current.mark);
  };

  useEffect(() => {
    const stop = () => { drag.current = null; };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
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
  const responseCount = room.participantCount || 0;
  const shareUrl = `${window.location.origin}/room/${room.code}`;

  return (
    <div className="view-content mark-view-container">
      {/* Top Header Card */}
      <div className="mark-header-panel">
        <div className="mark-title-col">
          <div className="mark-title-badges">
            <h2 className="display mark-room-name">{room.name}</h2>
            <span className="room-code-tag">Room <b>{room.code}</b></span>
            <div className="progress-pill">{responseCount} responded</div>
          </div>
          <p className="mark-guide-text">
            Drag or click on hours when you are <strong className="text-coral">busy / occupied</strong>. Unmarked times remain <strong className="text-gold">free</strong>.
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
              onKeyDown={handleFormKeyDown}
              className="field name-input-field"
              id="nameInput"
              placeholder="e.g. Juan Dela Cruz"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="off"
              required
              disabled={isLocked}
            />
          </div>
          <div className="preset-quick-actions">
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

        <div className="schedule-summary-action">
          <div className="schedule-hour-stats">
            <span className="stat-pill stat-busy">{totalBusyHours}h busy</span>
            <span className="stat-pill stat-free">{totalFreeHours}h free</span>
          </div>
          {isLocked ? (
            <div className="locked-label">Room is locked</div>
          ) : (
            <button className="btn-save-schedule" onClick={handleSaveSchedule} type="button">
              Save Schedule
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="grid-wrap">
        <div className="grid-scroll" ref={scrollRef} data-lenis-prevent>
          <div
            className="avail-grid"
            style={{ gridTemplateColumns: `60px repeat(${dates.length}, minmax(80px, 1fr))` }}
          >
            {/* Header row */}
            <div className="grid-corner"></div>
            {dates.map((d) => (
              <div key={d.getTime()} className="day-head">
                {DAY_NAMES[d.getDay()]}
                <span>{MONTH_NAMES[d.getMonth()]} {d.getDate()}</span>
              </div>
            ))}

            {/* 24-hour grid rows */}
            {HOURS.map((hLabel, hourIdx) => (
              <Fragment key={hourIdx}>
                <div className="time-label">{hLabel}</div>
                {dates.map((d) => {
                  const slotKey = `${formatDateISO(d)}_${hourIdx}`;
                  const isBusy = busySlots.has(slotKey);
                  return (
                    <div
                      key={slotKey}
                      className={`cell ${isBusy ? 'picked' : ''} ${isLocked ? 'cell-locked' : ''}`}
                      data-scroll-anchor={hourIdx === 8 ? 'true' : undefined}
                      onPointerDown={(e) => handlePointerDown(e, slotKey)}
                      onPointerEnter={() => handlePointerEnter(slotKey)}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
