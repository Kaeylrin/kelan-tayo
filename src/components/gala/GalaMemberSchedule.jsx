import React, { useState, useEffect, useRef } from 'react';
import { HOURS } from '../../constants/config.js';
import { saveWeeklyPattern } from '../../services/galaService.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Weekly busy-marking grid for a Regular Gala.
 * 7 columns (Mon–Sun) × 24 rows (hours).
 * Supports click and drag to mark/unmark hours.
 * If the gala is locked/confirmed, the grid is read-only.
 */
export function GalaMemberSchedule({ galaId, profileId, existingPatterns, isLocked, onSaved }) {
  // busyByDay: { 0: Set<number>, 1: Set<number>, ... 6: Set<number> }
  const [busyByDay, setBusyByDay] = useState(() => {
    const init = {};
    for (let d = 0; d < 7; d++) init[d] = new Set();
    return init;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragMarkMode, setDragMarkMode] = useState(true); // true = mark busy, false = un-mark
  const scrollRef = useRef(null);

  // Populate from existing patterns on mount / when patterns change
  useEffect(() => {
    if (!existingPatterns || existingPatterns.length === 0) return;
    const myPatterns = existingPatterns.filter((p) => p.profile_id === profileId);
    if (myPatterns.length === 0) return;

    setBusyByDay((prev) => {
      const next = {};
      for (let d = 0; d < 7; d++) next[d] = new Set(prev[d]);
      myPatterns.forEach((p) => {
        if (p.weekday !== undefined && Array.isArray(p.busy_hours)) {
          next[p.weekday] = new Set(p.busy_hours);
        }
      });
      return next;
    });
  }, [existingPatterns, profileId]);

  // Auto-scroll to 8am
  useEffect(() => {
    if (scrollRef.current) {
      const anchor = scrollRef.current.querySelector('[data-scroll-anchor="true"]');
      if (anchor) scrollRef.current.scrollTop = anchor.offsetTop - 30;
    }
  }, []);

  // Global mouse-up ends drag
  useEffect(() => {
    const up = () => setIsMouseDown(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const toggleCell = (day, hour, markAsBusy) => {
    if (isLocked) return;
    setBusyByDay((prev) => {
      const next = { ...prev, [day]: new Set(prev[day]) };
      if (markAsBusy) next[day].add(hour);
      else next[day].delete(hour);
      return next;
    });
  };

  const handleMouseDown = (day, hour) => {
    const currentlyBusy = busyByDay[day].has(hour);
    const newMode = !currentlyBusy;
    setIsMouseDown(true);
    setDragMarkMode(newMode);
    toggleCell(day, hour, newMode);
  };

  const handleMouseEnter = (day, hour) => {
    if (!isMouseDown) return;
    toggleCell(day, hour, dragMarkMode);
  };

  const handleTouchMove = (e) => {
    if (!isMouseDown) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.dataset && target.dataset.wday !== undefined) {
      const d = parseInt(target.dataset.wday, 10);
      const h = parseInt(target.dataset.hour, 10);
      if (!isNaN(d) && !isNaN(h)) toggleCell(d, h, dragMarkMode);
    }
  };

  const clearAll = () => {
    const cleared = {};
    for (let d = 0; d < 7; d++) cleared[d] = new Set();
    setBusyByDay(cleared);
  };

  const markAllBusy = () => {
    const all = {};
    for (let d = 0; d < 7; d++) {
      all[d] = new Set(Array.from({ length: 24 }, (_, i) => i));
    }
    setBusyByDay(all);
  };

  const handleSave = async () => {
    if (!galaId || !profileId) return;
    setIsSaving(true);
    setSaveMsg('');
    try {
      // Save each weekday that has data (or even if empty, to allow clearing)
      for (let d = 0; d < 7; d++) {
        await saveWeeklyPattern(galaId, profileId, d, Array.from(busyByDay[d]));
      }
      setSaveMsg('Weekly schedule saved!');
      if (onSaved) onSaved();
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMsg('Error saving schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalBusy = Object.values(busyByDay).reduce((sum, s) => sum + s.size, 0);
  const totalFree = 7 * 24 - totalBusy;

  return (
    <div className="gala-member-schedule">
      <div className="gala-section-header">
        <div>
          <h3 className="display gala-section-title">Your Weekly Schedule</h3>
          <p className="gala-section-sub">Mark the hours you're <strong style={{ color: 'var(--coral)' }}>busy</strong> each week. Unmarked = <strong style={{ color: 'var(--gold)' }}>free</strong>.</p>
        </div>
        {!isLocked && (
          <div className="gala-schedule-actions">
            <button className="btn-quick-toggle" type="button" onClick={clearAll}>Clear all</button>
            <button className="btn-quick-toggle" type="button" onClick={markAllBusy}>Mark all busy</button>
          </div>
        )}
      </div>

      {isLocked && (
        <div className="gala-locked-notice">
          🔒 This Regular Gala's pattern is confirmed. Your schedule is view-only.
        </div>
      )}

      {/* Grid */}
      <div className="grid-wrap">
        <div className="grid-scroll" ref={scrollRef}>
          <div
            className="weekly-grid"
            style={{ gridTemplateColumns: `60px repeat(7, minmax(70px, 1fr))` }}
            onTouchMove={handleTouchMove}
          >
            {/* Header row */}
            <div className="grid-corner"></div>
            {WEEKDAYS.map((day, di) => (
              <div key={di} className="weekly-header">{day}</div>
            ))}

            {/* Hour rows */}
            {HOURS.map((hLabel, hourIdx) => (
              <React.Fragment key={hourIdx}>
                <div className="time-label">{hLabel}</div>
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const isBusy = busyByDay[dayIdx].has(hourIdx);
                  return (
                    <div
                      key={dayIdx}
                      className={`cell ${isBusy ? 'picked' : ''} ${isLocked ? 'cell-locked' : ''}`}
                      data-wday={dayIdx}
                      data-hour={hourIdx}
                      data-scroll-anchor={hourIdx === 8 ? 'true' : undefined}
                      onMouseDown={(e) => {
                        if (isLocked) return;
                        e.preventDefault();
                        handleMouseDown(dayIdx, hourIdx);
                      }}
                      onMouseEnter={() => handleMouseEnter(dayIdx, hourIdx)}
                      onTouchStart={(e) => {
                        if (isLocked) return;
                        e.preventDefault();
                        setIsMouseDown(true);
                        const newMode = !busyByDay[dayIdx].has(hourIdx);
                        setDragMarkMode(newMode);
                        toggleCell(dayIdx, hourIdx, newMode);
                      }}
                      title={`${WEEKDAY_FULL[dayIdx]} ${hLabel} — ${isBusy ? 'Busy' : 'Free'}`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Save row */}
      {!isLocked && (
        <div className="gala-save-row">
          <div className="schedule-hour-stats">
            <span className="stat-pill stat-busy">{totalBusy}h busy</span>
            <span className="stat-pill stat-free">{totalFree}h free</span>
          </div>
          <div className="gala-save-right">
            {saveMsg && <span className="gala-save-msg">{saveMsg}</span>}
            <button
              className="btn-save-schedule"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save Weekly Schedule'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
