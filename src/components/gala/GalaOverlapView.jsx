import { Fragment, useMemo, useState } from 'react';
import { confirmGalaPattern, unconfirmGalaPattern } from '../../services/galaService.js';
import {
  WEEKDAYS, WEEKDAYS_FULL, computeWeeklyOverlap, findBestWindows, formatWindow, formatHourShort,
} from '../../utils/galaSchedule.js';
import { ConfirmDialog } from '../shared/Modals.jsx';

function heatColor(free, total) {
  if (total === 0 || free === 0) return 'var(--heat-0)';
  if (free === total) return 'var(--gold)';
  return `rgba(255, 198, 75, ${Math.max(0.18, (free / total) * 0.75).toFixed(2)})`;
}

/**
 * Group overlap for a Regular Gala: ranked recurring windows, a full weekly
 * heatmap, and (for the owner) confirming or reopening the recurring schedule.
 */
export function GalaOverlapView({ gala, members, patterns, isOwner, onGalaUpdated, showToast }) {
  const [selected, setSelected] = useState(() => new Set());
  const [isWorking, setIsWorking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);

  const overlap = useMemo(() => computeWeeklyOverlap(patterns, members), [patterns, members]);
  const windows = useMemo(() => findBestWindows(overlap), [overlap]);
  const names = useMemo(() => new Map(members.map((m) => [m.profile_id, m.display_name])), [members]);

  const responded = new Set(patterns.map((p) => p.profile_id));
  const waitingOn = members.filter((m) => !m.is_paused && !responded.has(m.profile_id));
  const pausedCount = members.filter((m) => m.is_paused).length;
  const total = overlap?.participantIds.length || 0;
  const isConfirmed = gala.status === 'confirmed';

  const toggle = (day) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  };

  const chosen = windows.filter((w) => selected.has(w.day));

  const handleConfirm = async () => {
    setIsWorking(true);
    try {
      const { gala: updated } = await confirmGalaPattern(
        gala.id,
        chosen.map(({ day, startHour, endHour }) => ({ weekday: day, startHour, endHour })),
      );
      setSelected(new Set());
      setConfirmOpen(false);
      showToast('Recurring schedule confirmed!');
      onGalaUpdated(updated);
    } catch (err) {
      showToast(err.message || 'Could not confirm the schedule.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleReopen = async () => {
    setIsWorking(true);
    try {
      const { gala: updated } = await unconfirmGalaPattern(gala.id);
      setReopenOpen(false);
      showToast('Schedule reopened. Pick new days anytime.');
      onGalaUpdated(updated);
    } catch (err) {
      showToast(err.message || 'Could not reopen the schedule.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <section className="gala-panel gala-overlap-view">
      <div className="gala-section-header">
        <div>
          <h2 className="display gala-section-title">Best recurring times</h2>
          <p className="gala-section-sub">
            {total === 0
              ? 'Waiting for schedules.'
              : `Based on ${total} member${total === 1 ? '' : 's'}${pausedCount ? ` · ${pausedCount} paused and not counted` : ''}.`}
          </p>
        </div>
        {isConfirmed && isOwner && (
          <button className="btn-secondary btn-compact" type="button" onClick={() => setReopenOpen(true)}>
            Change schedule
          </button>
        )}
      </div>

      {waitingOn.length > 0 && (
        <div className="gala-notice">
          Still waiting on <strong>{waitingOn.map((m) => m.display_name).join(', ')}</strong> to save their week.
        </div>
      )}

      {!overlap ? (
        <div className="gala-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 10h18M7 3v4M17 3v4M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          </svg>
          <p>No schedules yet. Once members save their usual week, the best recurring times show up here.</p>
        </div>
      ) : (
        <>
          {!isConfirmed && (
            windows.length === 0 ? (
              <div className="gala-empty-state gala-empty-sm">
                <p>Nobody is free at the same time yet. Ask the crew to double-check their weeks.</p>
              </div>
            ) : (
              <div className="gala-windows">
                {windows.map((w, i) => {
                  const isSelected = selected.has(w.day);
                  const freeNames = overlap.freeBySlot[w.day][w.startHour].map((id) => names.get(id));
                  const Tag = isOwner ? 'button' : 'div';
                  return (
                    <Tag
                      key={w.day}
                      type={isOwner ? 'button' : undefined}
                      className={`gala-window ${i === 0 ? 'is-top' : ''} ${isSelected ? 'is-selected' : ''} ${isOwner ? 'is-clickable' : ''}`}
                      onClick={isOwner ? () => toggle(w.day) : undefined}
                      aria-pressed={isOwner ? isSelected : undefined}
                      style={{ '--i': i }}
                    >
                      <div className="gala-window-top">
                        <span className="gala-window-day display">{WEEKDAYS_FULL[w.day]}</span>
                        {i === 0 && <span className="best-badge">Best match</span>}
                        {isOwner && <span className="gala-window-check" aria-hidden="true">{isSelected ? '✓' : ''}</span>}
                      </div>
                      <div className="gala-window-time">{formatWindow(w.startHour, w.endHour)} · {w.hours}h</div>
                      <div className="gala-window-bar"><span style={{ width: `${w.pct}%` }} /></div>
                      <div className="gala-window-free">
                        {w.freeCount} of {total} free ({w.pct}%)
                        {w.freeCount < total && <span title={freeNames.join(', ')}> · {freeNames.slice(0, 3).join(', ')}{freeNames.length > 3 ? '…' : ''}</span>}
                      </div>
                    </Tag>
                  );
                })}
              </div>
            )
          )}

          {!isConfirmed && isOwner && windows.length > 0 && (
            <div className="gala-confirm-row">
              <span className="gala-section-sub">
                {chosen.length === 0 ? 'Pick one or more days to make them the regular schedule.' : `${chosen.length} day${chosen.length === 1 ? '' : 's'} selected`}
              </span>
              <button className="btn-primary btn-inline" type="button" disabled={chosen.length === 0} onClick={() => setConfirmOpen(true)}>
                Confirm schedule
              </button>
            </div>
          )}
          {!isConfirmed && !isOwner && windows.length > 0 && (
            <p className="gala-section-sub gala-owner-hint">The gala owner picks the final days from these options.</p>
          )}

          <div className="gala-mini-heatmap">
            <div className="gala-mini-heatmap-head">
              <span className="gala-mini-heatmap-label">Full weekly heatmap</span>
              <span className="legend-inline">
                <span className="legend-swatch swatch-0" /> none
                <span className="legend-swatch swatch-some" /> some
                <span className="legend-swatch swatch-all" /> everyone
              </span>
            </div>
            <div className="gala-mini-heatmap-scroll" data-lenis-prevent>
              <div className="gala-mini-grid">
                <div />
                {WEEKDAYS.map((d) => <div key={d} className="gala-mini-day">{d}</div>)}
                {Array.from({ length: 24 }, (_, h) => (
                  <Fragment key={h}>
                    <div className="gala-mini-hour">{h % 3 === 0 ? formatHourShort(h) : ''}</div>
                    {WEEKDAYS.map((_, d) => {
                      const free = overlap.freeCounts[d][h];
                      const freeNames = overlap.freeBySlot[d][h].map((id) => names.get(id));
                      return (
                        <div
                          key={d}
                          className="gala-mini-cell"
                          style={{ background: heatColor(free, total) }}
                          title={`${WEEKDAYS_FULL[d]} ${formatHourShort(h)}: ${free}/${total} free${freeNames.length ? ` (${freeNames.join(', ')})` : ''}`}
                        />
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Confirm the regular schedule?"
          confirmLabel="Confirm"
          busy={isWorking}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirm}
        >
          <p>Your crew will meet every:</p>
          <ul className="modal-list">
            {chosen.map((w) => <li key={w.day}><strong>{WEEKDAYS_FULL[w.day]}</strong>, {formatWindow(w.startHour, w.endHour)}</li>)}
          </ul>
          <p className="modal-subtext">It repeats every week until you change it. Use exceptions for one-off breaks.</p>
        </ConfirmDialog>
      )}

      {reopenOpen && (
        <ConfirmDialog
          title="Change the schedule?"
          confirmLabel="Reopen schedule"
          busy={isWorking}
          onClose={() => setReopenOpen(false)}
          onConfirm={handleReopen}
        >
          <p>This clears the confirmed days so you can pick new ones. Everyone's saved weeks stay as they are.</p>
        </ConfirmDialog>
      )}
    </section>
  );
}
