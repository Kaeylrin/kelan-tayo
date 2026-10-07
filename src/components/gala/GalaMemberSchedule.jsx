import { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import { HOURS } from '../../constants/config.js';
import { saveWeeklyPatterns } from '../../services/galaService.js';
import { scrollGridToAnchor } from '../../utils/storage.js';
import { WEEKDAYS, WEEKDAYS_FULL } from '../../utils/galaSchedule.js';

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

function toKeySet(patterns) {
  const set = new Set();
  (patterns || []).forEach((p) => (p.busy_hours || []).forEach((h) => set.add(`${p.weekday}_${h}`)));
  return set;
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const k of a) if (!b.has(k)) return false;
  return true;
}

/**
 * Weekly busy-marking grid for a Regular Gala: 7 columns (Mon–Sun) × 24 hours.
 * Click or drag (mouse, touch or pen) to mark busy hours, then save.
 */
export function GalaMemberSchedule({ galaId, myPatterns, isConfirmed, onSaved, showToast }) {
  const savedSet = useMemo(() => toKeySet(myPatterns), [myPatterns]);
  const [busy, setBusy] = useState(savedSet);
  const [isSaving, setIsSaving] = useState(false);
  const drag = useRef(null); // { mark: boolean } while dragging
  const scrollRef = useRef(null);

  const isDirty = !sameSet(busy, savedSet);
  const hasSaved = (myPatterns || []).length > 0;

  // Start the grid around 8am.
  useEffect(() => { scrollGridToAnchor(scrollRef.current); }, []);

  useEffect(() => {
    const stop = () => { drag.current = null; };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const setCell = (key, mark) => {
    setBusy((prev) => {
      if (prev.has(key) === mark) return prev;
      const next = new Set(prev);
      if (mark) next.add(key); else next.delete(key);
      return next;
    });
  };

  const handlePointerDown = (e, key) => {
    if (e.button !== 0) return;
    e.preventDefault();
    // Let pointerenter fire on the other cells while a finger drags.
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    const mark = !busy.has(key);
    drag.current = { mark };
    setCell(key, mark);
  };

  const handlePointerEnter = (key) => {
    if (drag.current) setCell(key, drag.current.mark);
  };

  const fillDay = (day, mark) => {
    setBusy((prev) => {
      const next = new Set(prev);
      ALL_HOURS.forEach((h) => (mark ? next.add(`${day}_${h}`) : next.delete(`${day}_${h}`)));
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const patterns = {};
    for (let d = 0; d < 7; d++) patterns[d] = ALL_HOURS.filter((h) => busy.has(`${d}_${h}`));
    try {
      await saveWeeklyPatterns(galaId, patterns);
      showToast('Weekly schedule saved!');
      await onSaved();
    } catch (err) {
      showToast(err.message || 'Could not save your schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalBusy = busy.size;

  return (
    <section className="gala-panel gala-member-schedule">
      <div className="gala-section-header">
        <div>
          <h2 className="display gala-section-title">Your usual week</h2>
          <p className="gala-section-sub">
            Drag across the hours you're <strong className="text-coral">busy</strong> every week.
            Unmarked hours count as <strong className="text-gold">free</strong>.
          </p>
        </div>
        <div className="gala-schedule-actions">
          <button className="btn-quick-toggle" type="button" onClick={() => setBusy(new Set())} disabled={isSaving}>
            Clear all
          </button>
          <button className="btn-quick-toggle" type="button" onClick={() => setBusy(savedSet)} disabled={!isDirty || isSaving}>
            Undo changes
          </button>
        </div>
      </div>

      {isConfirmed && (
        <div className="gala-notice">
          The group's schedule is already confirmed. Updating your week still helps the owner spot conflicts.
        </div>
      )}
      {!hasSaved && (
        <div className="gala-notice gala-notice-gold">
          You haven't saved a schedule yet, so you're not counted in the group overlap.
        </div>
      )}

      <div className="grid-wrap">
        <div className="grid-scroll" ref={scrollRef} data-lenis-prevent>
          <div className="weekly-grid" role="grid" aria-label="Weekly busy hours">
            <div className="grid-corner" />
            {WEEKDAYS.map((day, di) => {
              const full = ALL_HOURS.every((h) => busy.has(`${di}_${h}`));
              return (
                <button
                  key={day}
                  type="button"
                  className="day-head day-head-btn"
                  onClick={() => fillDay(di, !full)}
                  title={full ? `Mark all of ${WEEKDAYS_FULL[di]} free` : `Mark all of ${WEEKDAYS_FULL[di]} busy`}
                >
                  {day}
                  <span>{full ? 'all busy' : 'tap to fill'}</span>
                </button>
              );
            })}

            {HOURS.map((label, hour) => (
              <Fragment key={hour}>
                <div className="time-label">{label}</div>
                {WEEKDAYS.map((_, day) => {
                  const key = `${day}_${hour}`;
                  const isBusy = busy.has(key);
                  return (
                    <div
                      key={key}
                      role="gridcell"
                      aria-selected={isBusy}
                      className={`cell ${isBusy ? 'picked' : ''}`}
                      data-scroll-anchor={hour === 8 ? 'true' : undefined}
                      onPointerDown={(e) => handlePointerDown(e, key)}
                      onPointerEnter={() => handlePointerEnter(key)}
                      title={`${WEEKDAYS_FULL[day]} ${label}: ${isBusy ? 'busy' : 'free'}`}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className={`gala-save-row ${isDirty ? 'is-dirty' : ''}`}>
        <div className="schedule-hour-stats">
          <span className="stat-pill stat-busy">{totalBusy}h busy</span>
          <span className="stat-pill stat-free">{7 * 24 - totalBusy}h free</span>
          {isDirty && <span className="gala-unsaved">Unsaved changes</span>}
        </div>
        <button className="btn-save-schedule" type="button" onClick={handleSave} disabled={isSaving || (!isDirty && hasSaved)}>
          {isSaving ? 'Saving…' : hasSaved && !isDirty ? 'Saved' : 'Save weekly schedule'}
        </button>
      </div>
    </section>
  );
}
