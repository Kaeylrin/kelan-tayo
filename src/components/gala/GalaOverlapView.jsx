import React, { useMemo, useState } from 'react';
import { confirmGalaPattern } from '../../services/galaService.js';

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Calculates the best recurring time slots by aggregating all members'
 * gala_patterns and finding which weekday+hour has the most members free.
 *
 * Props:
 *  - galaId
 *  - patterns: gala_patterns rows from Supabase (with profiles embedded)
 *  - memberCount: total number of gala members
 *  - gala: the full regular_galas row
 *  - currentProfileId: the viewing user's profile id
 *  - isOwner: boolean
 *  - onConfirmed: callback after successful confirmation
 */
export function GalaOverlapView({ galaId, patterns, memberCount, gala, currentProfileId, isOwner, onConfirmed }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [editMode, setEditMode] = useState(false);

  // ── Compute free-count heatmap ────────────────────────────────────────────
  // For each (weekday, hour) slot, count how many unique members are FREE
  // (i.e., that hour is NOT in their busy_hours for that weekday).
  const heatmap = useMemo(() => {
    if (!patterns || patterns.length === 0) return null;

    // Build a set of unique profile IDs that have submitted patterns
    const profilesWithPatterns = new Set(patterns.map((p) => p.profile_id));
    const participantCount = profilesWithPatterns.size;
    if (participantCount === 0) return null;

    // For each weekday, for each hour, count who is busy
    const busyCounts = Array.from({ length: 7 }, () => new Array(24).fill(0));
    patterns.forEach((p) => {
      if (!Array.isArray(p.busy_hours)) return;
      p.busy_hours.forEach((h) => {
        busyCounts[p.weekday][h]++;
      });
    });

    // Free count = participantCount - busyCount
    const freeCounts = busyCounts.map((dayArr) =>
      dayArr.map((busy) => participantCount - busy)
    );

    return { freeCounts, participantCount };
  }, [patterns]);

  // ── Find the best slots (weekday + contiguous free window) ────────────────
  const bestSlots = useMemo(() => {
    if (!heatmap) return [];

    const { freeCounts, participantCount } = heatmap;
    const results = [];

    for (let day = 0; day < 7; day++) {
      // Find peak free hour for this day
      let maxFree = 0;
      let bestStartHour = -1;

      for (let h = 0; h < 24; h++) {
        if (freeCounts[day][h] > maxFree) {
          maxFree = freeCounts[day][h];
          bestStartHour = h;
        }
      }

      if (maxFree === 0 || bestStartHour === -1) continue;

      // Extend forward to find the longest contiguous window at this free level
      let endHour = bestStartHour;
      while (endHour + 1 < 24 && freeCounts[day][endHour + 1] >= maxFree) {
        endHour++;
      }

      results.push({
        day,
        startHour: bestStartHour,
        endHour,
        freeCount: maxFree,
        participantCount,
        pct: Math.round((maxFree / participantCount) * 100),
      });
    }

    // Sort by freeCount descending, then pct
    results.sort((a, b) => b.freeCount - a.freeCount || b.pct - a.pct);
    return results.slice(0, 5); // Top 5 candidates
  }, [heatmap]);

  // ── Top pick ──────────────────────────────────────────────────────────────
  const topPick = bestSlots[0] || null;

  const formatHour = (h) => {
    if (h === 0) return '12am';
    if (h < 12) return `${h}am`;
    if (h === 12) return '12pm';
    return `${h - 12}pm`;
  };

  // ── Heatmap max for color scaling ──────────────────────────────────────────
  const heatmapMax = heatmap ? heatmap.participantCount : 1;

  const getHeatColor = (freeCount, max) => {
    if (max === 0 || freeCount === 0) return 'rgba(246, 241, 231, 0.07)';
    const ratio = freeCount / max;
    if (ratio >= 1) return 'var(--gold)';
    if (ratio >= 0.6) return 'rgba(255, 198, 75, 0.55)';
    if (ratio >= 0.3) return 'rgba(255, 198, 75, 0.28)';
    return 'rgba(246, 241, 231, 0.12)';
  };

  // ── Confirmed state ───────────────────────────────────────────────────────
  const isConfirmed = gala?.status === 'confirmed' && !editMode;
  const confirmedDays = gala?.confirmed_days || [];

  const handleConfirm = async () => {
    if (!topPick) return;
    setIsConfirming(true);
    setConfirmMsg('');
    try {
      const confirmedDaysPayload = [
        {
          weekday: topPick.day,
          startHour: topPick.startHour,
          endHour: topPick.endHour,
        },
      ];
      await confirmGalaPattern(galaId, currentProfileId, confirmedDaysPayload);
      setConfirmMsg('Pattern confirmed! ✓');
      setEditMode(false);
      if (onConfirmed) onConfirmed();
      setTimeout(() => setConfirmMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setConfirmMsg('Error confirming pattern.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!patterns || patterns.length === 0) {
    return (
      <div className="gala-overlap-view">
        <h3 className="display gala-section-title">Best Times</h3>
        <div className="gala-empty-state">
          <p>No schedules submitted yet. Members need to fill in their weekly availability first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gala-overlap-view">
      <div className="gala-section-header">
        <div>
          <h3 className="display gala-section-title">Best Recurring Times</h3>
          <p className="gala-section-sub">
            Based on {heatmap?.participantCount || 0} member{heatmap?.participantCount !== 1 ? 's' : ''} &bull; Brighter = more people free
          </p>
        </div>
        {isConfirmed && isOwner && !editMode && (
          <button className="btn-secondary btn-compact" onClick={() => setEditMode(true)}>
            Edit Pattern
          </button>
        )}
      </div>

      {/* Confirmed banner */}
      {isConfirmed && confirmedDays.length > 0 && (
        <div className="gala-confirmed-banner">
          <span className="gala-confirmed-icon">✓</span>
          <div>
            <div className="gala-confirmed-label">Confirmed Regular Gala Schedule</div>
            {confirmedDays.map((cd, i) => (
              <div key={i} className="gala-confirmed-slot">
                Every <strong>{WEEKDAY_NAMES[cd.weekday]}</strong>,&nbsp;
                {formatHour(cd.startHour)}–{formatHour(cd.endHour + 1)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top pick card */}
      {topPick && (!isConfirmed || editMode) && (
        <div className="gala-best-pick">
          <div className="best-badge">Best match</div>
          <div className="gala-pick-day display">{WEEKDAY_NAMES[topPick.day]}</div>
          <div className="gala-pick-time">
            {formatHour(topPick.startHour)}–{formatHour(topPick.endHour + 1)}
          </div>
          <div className="gala-pick-free">
            {topPick.freeCount} of {topPick.participantCount} member{topPick.participantCount !== 1 ? 's' : ''} free ({topPick.pct}%)
          </div>
          {isOwner && (
            <div className="gala-confirm-row">
              {confirmMsg && <span className="gala-save-msg">{confirmMsg}</span>}
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '9px 22px' }}
                onClick={handleConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? 'Confirming…' : '✓ Confirm this pattern'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Other candidates */}
      {bestSlots.length > 1 && (!isConfirmed || editMode) && (
        <div className="gala-candidates">
          <div className="gala-candidates-label">Other good times</div>
          {bestSlots.slice(1).map((slot, i) => (
            <div key={i} className="gala-candidate-row">
              <span className="gala-candidate-day">{WEEKDAY_SHORT[slot.day]}</span>
              <span className="gala-candidate-time">
                {formatHour(slot.startHour)}–{formatHour(slot.endHour + 1)}
              </span>
              <div className="gala-candidate-bar-wrap">
                <div
                  className="gala-candidate-bar"
                  style={{ width: `${slot.pct}%` }}
                />
              </div>
              <span className="gala-candidate-pct">{slot.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Mini heatmap (weekday × 24h grid) */}
      {heatmap && (!isConfirmed || editMode) && (
        <div className="gala-mini-heatmap">
          <div className="gala-mini-heatmap-label">Full weekly heatmap</div>
          <div className="gala-mini-heatmap-scroll">
            <div
              className="gala-mini-grid"
              style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}
            >
              {/* Header */}
              <div />
              {WEEKDAY_SHORT.map((d) => (
                <div key={d} className="weekly-header" style={{ fontSize: '11px' }}>{d}</div>
              ))}
              {/* Hour rows — only show every 2 hours to keep it compact */}
              {Array.from({ length: 24 }, (_, h) => (
                <React.Fragment key={h}>
                  <div className="time-label" style={{ fontSize: '10px', height: '16px' }}>
                    {h % 3 === 0 ? (h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`) : ''}
                  </div>
                  {Array.from({ length: 7 }, (_, d) => (
                    <div
                      key={d}
                      className="heat-cell"
                      style={{
                        height: '16px',
                        margin: '1px',
                        borderRadius: '3px',
                        background: getHeatColor(heatmap.freeCounts[d][h], heatmapMax),
                      }}
                      title={`${WEEKDAY_NAMES[d]} ${formatHour(h)}: ${heatmap.freeCounts[d][h]} free`}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="gala-heatmap-legend">
            <span className="legend-swatch swatch-0" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(246,241,231,0.07)', marginRight: 4 }} />None free
            &nbsp;&nbsp;
            <span className="legend-swatch" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(255,198,75,0.28)', marginRight: 4 }} />Some free
            &nbsp;&nbsp;
            <span className="legend-swatch swatch-all" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--gold)', marginRight: 4 }} />All free
          </div>
        </div>
      )}
    </div>
  );
}
