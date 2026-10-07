import { Fragment, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { HOURS, AVATAR_COLORS, DAY_NAMES, DAY_NAMES_FULL, MONTH_NAMES } from '../../constants/config.js';
import { getDatesArray, formatDateISO, formatTimeSpan, formatClock, scrollGridToAnchor } from '../../utils/storage.js';
import { computeFreeOverlap } from '../../utils/scheduler.js';
import { getRoomAvailability } from '../../services/availabilityService.js';
import { listMembers } from '../../services/memberService.js';

function heatBackground(freeCount, total) {
  if (total === 0) return 'var(--heat-0)';
  if (freeCount === total) return 'var(--gold)';
  if (freeCount > 0) return `rgba(255, 198, 75, ${Math.max(0.18, freeCount / total).toFixed(2)})`;
  return 'rgba(255, 107, 92, 0.15)';
}

const optionLabel = (date) => `${DAY_NAMES_FULL[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;

export function DashboardView({ room, currentUser, onRefresh, onLockInDate, onUnlockRoom, showToast }) {
  const dates = useMemo(() => getDatesArray(room.startDate, room.endDate), [room.startDate, room.endDate]);
  const [members, setMembers] = useState([]);
  const [busyById, setBusyById] = useState({}); // { memberId: ["2026-09-08_14", ...] }
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const heatScrollRef = useRef(null);

  const isCreator = currentUser?.id === room.creator_member_id;
  const isConfirmed = room.status === 'confirmed';

  const fetchData = useCallback(async () => {
    try {
      const [membersData, availData] = await Promise.all([listMembers(room.id), getRoomAvailability(room.id)]);
      const map = {};
      membersData.forEach((m) => { map[m.id] = []; });
      availData.forEach((entry) => {
        const id = entry.members?.id;
        if (id && map[id] && entry.busy_hours) entry.busy_hours.forEach((h) => map[id].push(`${entry.date}_${h}`));
      });
      setMembers(membersData);
      setBusyById(map);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast?.('Could not load the latest schedules.');
    } finally {
      setIsLoading(false);
    }
  }, [room.id, showToast]);

  // fetchData only sets state after its first await.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!isLoading) scrollGridToAnchor(heatScrollRef.current);
  }, [isLoading]);

  const nameById = useMemo(() => new Map(members.map((m) => [m.id, m.display_name])), [members]);
  const toNames = useCallback((ids) => ids.map((id) => nameById.get(id) || 'Someone'), [nameById]);

  const { bestMatch, backupOptions } = useMemo(
    () => computeFreeOverlap(dates, busyById, room.preferred_start, room.preferred_end),
    [dates, busyById, room.preferred_start, room.preferred_end],
  );

  // Precompute free member ids for every cell once per data change.
  const freeBySlot = useMemo(() => {
    const busySets = members.map((m) => [m.id, new Set(busyById[m.id] || [])]);
    const result = new Map();
    dates.forEach((d) => {
      const ds = formatDateISO(d);
      for (let h = 0; h < 24; h++) {
        const key = `${ds}_${h}`;
        result.set(key, busySets.filter(([, set]) => !set.has(key)).map(([id]) => id));
      }
    });
    return result;
  }, [dates, members, busyById]);

  const totalMembers = members.length;

  const handleManualRefresh = async () => {
    setIsLoading(true);
    await fetchData();
    onRefresh();
  };

  const lockIn = (option) => onLockInDate({
    date: formatDateISO(option.date),
    startHour: option.startHour,
    endHour: option.endHour,
  });

  if (isLoading) {
    return (
      <div className="view-content page-loading" role="status">
        <div className="loading-spinner" />
        <div className="loading-text">Loading live data...</div>
      </div>
    );
  }

  return (
    <div className="view-content">
      <div className="dash-header-compact">
        <div className="dash-title-meta">
          <h2 className="display">{room.name}</h2>
          <span className="room-code-tag">Room <b>{room.code}</b> &middot; live overlap</span>
        </div>

        <div className="dash-header-right">
          <div className="avatar-stack">
            {members.length === 0 && <span className="text-muted-sm">No responses yet</span>}
            {members.map((m, idx) => (
              <div key={m.id} className="avatar" style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }} title={m.display_name}>
                {m.display_name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <button className="btn-refresh" onClick={handleManualRefresh} title="Refresh dashboard" aria-label="Refresh dashboard" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="dash-grid">
        <div className="heatmap-card">
          <div className="heatmap-header-row">
            <div>
              <div className="heatmap-title">Free Time Heatmap</div>
              <div className="heatmap-sub">Darker gold means more friends free &middot; Coral means nobody is free</div>
            </div>
            <div className="legend-inline">
              <span className="legend-swatch swatch-0" /> 0 free
              <span className="legend-swatch swatch-some" /> some
              <span className="legend-swatch swatch-all" /> all free
            </div>
          </div>

          <div className="grid-wrap grid-wrap-flat">
            <div className="grid-scroll" ref={heatScrollRef} data-lenis-prevent>
              <div className="heat-grid" style={{ gridTemplateColumns: `54px repeat(${dates.length}, minmax(58px, 1fr))` }}>
                <div className="grid-corner" />
                {dates.map((d) => (
                  <div key={d.getTime()} className="day-head">
                    {DAY_NAMES[d.getDay()]}
                    <span>{MONTH_NAMES[d.getMonth()]} {d.getDate()}</span>
                  </div>
                ))}

                {HOURS.map((hLabel, hourIdx) => (
                  <Fragment key={hourIdx}>
                    <div className="time-label">{hLabel}</div>
                    {dates.map((d) => {
                      const slotKey = `${formatDateISO(d)}_${hourIdx}`;
                      const freeNames = toNames(freeBySlot.get(slotKey) || []);
                      const freeCount = freeNames.length;
                      return (
                        <div
                          key={slotKey}
                          className="heat-cell"
                          style={{ background: heatBackground(freeCount, totalMembers) }}
                          title={`${hLabel} on ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}: ${freeCount}/${totalMembers} free ${freeCount ? `(${freeNames.join(', ')})` : '(all busy)'}`}
                          data-scroll-anchor={hourIdx === 8 ? 'true' : undefined}
                        />
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="side-col">
          {isConfirmed ? (
            <div className="best-card">
              <div className="best-badge">Confirmed Plan</div>
              <div className="date display">
                {new Date(`${room.confirmed_date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="who">
                <strong className="text-gold">{formatClock(room.confirmed_start)} – {formatClock(room.confirmed_end)}</strong>
              </div>
              <p className="card-note">This room is locked. No further changes can be made to schedules.</p>
              {isCreator && (
                <button className="btn-secondary btn-compact btn-block" type="button" onClick={onUnlockRoom}>
                  Unlock &amp; Change Date
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="best-card">
                <div className="best-badge">Best Match</div>
                {room.preferred_start && room.preferred_end && (
                  <div className="preferred-window-note">
                    Showing matches between {formatClock(room.preferred_start)} and {formatClock(room.preferred_end)}
                  </div>
                )}
                {bestMatch ? (
                  <>
                    <div className="date display">{optionLabel(bestMatch.date)}</div>
                    <div className="who">
                      {formatTimeSpan(bestMatch.startHour, bestMatch.endHour)} &middot;{' '}
                      <strong className="text-gold">
                        {bestMatch.count === totalMembers ? `all ${totalMembers} free!` : `${bestMatch.count} of ${totalMembers} free`}
                      </strong>
                    </div>
                    {isCreator ? (
                      <button className="pick-btn" type="button" onClick={() => lockIn(bestMatch)}>Pick this date</button>
                    ) : (
                      <div className="card-note">Waiting for the creator to confirm</div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="date display date-sm">{totalMembers === 0 ? 'Waiting for responses' : 'No common free time'}</div>
                    <div className="who">
                      {totalMembers === 0 ? 'Share the room link with your friends to see overlap.' : 'All submitted schedules overlap with busy hours.'}
                    </div>
                  </>
                )}
              </div>

              <div className="options-card">
                <h3>Other options</h3>
                <p className="options-sub">In case the best match doesn't work for everyone.</p>

                {backupOptions.length === 0 ? (
                  <div className="text-muted-sm">{totalMembers === 0 ? 'No options yet.' : 'No alternative overlapping dates found.'}</div>
                ) : (
                  backupOptions.map((opt, idx) => {
                    const isFull = opt.count === totalMembers;
                    const missing = toNames(opt.missingMembers);
                    const missingText = missing.length > 0
                      ? ` · ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? ' & others' : ''} busy`
                      : '';
                    return (
                      <label key={idx} className={`option-row ${selectedBackup === idx ? 'selected' : ''} ${isCreator ? '' : 'is-readonly'}`}>
                        <input
                          type="radio"
                          name="dateBackupOption"
                          checked={selectedBackup === idx}
                          onChange={() => setSelectedBackup(idx)}
                          disabled={!isCreator}
                        />
                        <div className="option-body">
                          <div className="option-top">
                            <span className="option-date display">{optionLabel(opt.date)}</span>
                            <span className={`option-badge ${isFull ? 'badge-full' : 'badge-partial'}`}>{opt.count} of {totalMembers} free</span>
                          </div>
                          <div className="option-time">{formatTimeSpan(opt.startHour, opt.endHour)}{missingText}</div>
                        </div>
                      </label>
                    );
                  })
                )}

                {backupOptions.length > 0 && isCreator && (
                  <button
                    className="btn-secondary btn-compact btn-block"
                    type="button"
                    disabled={selectedBackup === null || !backupOptions[selectedBackup]}
                    onClick={() => lockIn(backupOptions[selectedBackup])}
                  >
                    Confirm selected date
                  </button>
                )}
              </div>
            </>
          )}

          <div className="status-card">
            <div className="status-card-header">
              <h3>Who's responded</h3>
              <span className="status-count-badge">{totalMembers} member{totalMembers === 1 ? '' : 's'}</span>
            </div>
            {totalMembers === 0 ? (
              <div className="text-muted-sm">No responses yet. Send the room link to your barkada!</div>
            ) : (
              <div className="status-list-compact" data-lenis-prevent>
                {members.map((m) => {
                  const busyCount = (busyById[m.id] || []).length;
                  return (
                    <div key={m.id} className="status-item">
                      <span className="status-name">
                        <span className="status-dot dot-done" />
                        {m.display_name}
                        {m.id === currentUser?.id && <span className="status-you">you</span>}
                      </span>
                      <span className="status-state">{busyCount === 0 ? 'Free all day' : `${busyCount}h busy`}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
