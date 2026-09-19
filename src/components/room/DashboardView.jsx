import React, { useMemo, useRef, useState, useEffect } from 'react';
import { HOURS, AVATAR_COLORS, DAY_NAMES, DAY_NAMES_FULL, MONTH_NAMES } from '../../constants/config.js';
import { getDatesArray, formatDateISO, formatTimeSpan } from '../../utils/storage.js';
import { computeFreeOverlap } from '../../utils/scheduler.js';
import { getRoomAvailability } from '../../services/availabilityService.js';
import { listMembers } from '../../services/memberService.js';

export function DashboardView({ room, currentUser, onRefresh, onLockInDate, onUnlockRoom }) {
  const dates = useMemo(() => getDatesArray(room.startDate, room.endDate), [room.startDate, room.endDate]);
  const [participants, setParticipants] = useState({});
  const [memberNames, setMemberNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBackupDate, setSelectedBackupDate] = useState(null);
  
  const heatScrollRef = useRef(null);

  const isCreator = currentUser?.id === room.creator_member_id;
  const isConfirmed = room.status === 'confirmed';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersData, availData] = await Promise.all([
        listMembers(room.id),
        getRoomAvailability(room.id)
      ]);
      
      const names = membersData.map(m => m.display_name);
      setMemberNames(names);

      // Build the participants map: { "Name": ["2026-09-08_14", ...] }
      const pMap = {};
      names.forEach(n => pMap[n] = []);
      
      availData.forEach(entry => {
        const dName = entry.members?.display_name;
        if (dName && pMap[dName] && entry.busy_hours) {
          entry.busy_hours.forEach(hour => {
            pMap[dName].push(`${entry.date}_${hour}`);
          });
        }
      });
      setParticipants(pMap);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [room.id]);

  useEffect(() => {
    if (!isLoading && heatScrollRef.current) {
      const anchor = heatScrollRef.current.querySelector('[data-scroll-anchor="true"]');
      if (anchor) {
        heatScrollRef.current.scrollTop = anchor.offsetTop - 30;
      }
    }
  }, [isLoading]);

  // Compute Overlap Analysis
  const { bestMatch, backupOptions } = useMemo(() => {
    return computeFreeOverlap(dates, participants, room.preferred_start, room.preferred_end);
  }, [dates, participants, room.preferred_start, room.preferred_end]);

  const totalMembers = memberNames.length;

  const getFreeMembersForSlot = (slotKey) => {
    return memberNames.filter(name => {
      const busyList = participants[name] || [];
      return !busyList.includes(slotKey);
    });
  };

  const handleManualRefresh = async () => {
    await fetchData();
    onRefresh();
  };

  if (isLoading) {
    return (
      <div className="view-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text" style={{ fontSize: '18px' }}>Loading live data...</div>
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
            {memberNames.length === 0 && (
              <span style={{ fontSize: '12px', color: 'var(--cream-muted)' }}>No responses yet</span>
            )}
            {memberNames.map((name, idx) => (
              <div
                key={idx}
                className="avatar"
                style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                title={name}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <button className="btn-refresh" onClick={handleManualRefresh} title="Refresh Dashboard" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="dash-grid">
        <div className="heatmap-card">
          <div className="heatmap-header-row">
            <div>
              <div className="heatmap-title">Free Time Heatmap</div>
              <div className="heatmap-sub">
                Darker gold means more friends free &middot; Coral indicates schedule conflicts
              </div>
            </div>
            <div className="legend-inline">
              <span className="legend-swatch swatch-0"></span> 0 free
              <span className="legend-swatch swatch-some" style={{ marginLeft: '10px' }}></span> some
              <span className="legend-swatch swatch-all" style={{ marginLeft: '10px' }}></span> all free
            </div>
          </div>

          <div className="grid-wrap" style={{ padding: '6px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <div className="grid-scroll" ref={heatScrollRef} style={{ maxHeight: '430px' }}>
              <div
                className="heat-grid"
                style={{ gridTemplateColumns: `54px repeat(${dates.length}, minmax(58px, 1fr))` }}
              >
                <div className="grid-corner"></div>
                {dates.map((d, i) => (
                  <div key={i} className="day-head">
                    {DAY_NAMES[d.getDay()]}
                    <span>{MONTH_NAMES[d.getMonth()]} {d.getDate()}</span>
                  </div>
                ))}

                {HOURS.map((hLabel, hourIdx) => (
                  <React.Fragment key={hourIdx}>
                    <div className="time-label">{hLabel}</div>
                    {dates.map((d, dIdx) => {
                      const slotKey = `${formatDateISO(d)}_${hourIdx}`;
                      const freeMembers = getFreeMembersForSlot(slotKey);
                      const freeCount = freeMembers.length;

                      let bg = 'rgba(246, 241, 231, 0.07)';
                      if (totalMembers > 0) {
                        if (freeCount === totalMembers) {
                          bg = '#FFC64B';
                        } else if (freeCount > 0) {
                          const alpha = Math.max(0.18, freeCount / totalMembers);
                          bg = `rgba(255, 198, 75, ${alpha})`;
                        } else {
                          bg = 'rgba(255, 107, 92, 0.15)';
                        }
                      }

                      const dateFormatted = `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
                      const tooltip = `${hLabel} on ${dateFormatted}: ${freeCount}/${totalMembers} free ${freeMembers.length ? `(${freeMembers.join(', ')})` : '(All busy)'}`;

                      return (
                        <div
                          key={dIdx}
                          className="heat-cell"
                          style={{ background: bg }}
                          title={tooltip}
                          data-scroll-anchor={hourIdx === 8 ? 'true' : undefined}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="side-col">
          {isConfirmed ? (
            <div className="best-card" style={{ border: '2px solid var(--gold)' }}>
              <div className="best-badge">Confirmed Plan</div>
              <div className="date display">
                {new Date(room.confirmed_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="who" style={{ fontSize: '15px' }}>
                <strong style={{ color: 'var(--gold)' }}>{room.confirmed_start.slice(0, 5)} - {room.confirmed_end.slice(0, 5)}</strong>
              </div>
              <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--cream-muted)' }}>
                This room is locked. No further changes can be made to schedules.
              </p>
              {isCreator && (
                <button
                  className="btn-secondary btn-compact"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={onUnlockRoom}
                >
                  Unlock & Change Date
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="best-card">
                <div className="best-badge">Best Match</div>
                {room.preferred_start && room.preferred_end && (
                  <div className="preferred-window-note">
                    Showing matches between {room.preferred_start.slice(0, 5)} and {room.preferred_end.slice(0, 5)}
                  </div>
                )}
                {bestMatch ? (
                  <>
                    <div className="date display">
                      {DAY_NAMES_FULL[bestMatch.date.getDay()]}, {MONTH_NAMES[bestMatch.date.getMonth()]} {bestMatch.date.getDate()}
                    </div>
                    <div className="who">
                      {formatTimeSpan(bestMatch.startHour, bestMatch.endHour)} &middot;{' '}
                      <strong style={{ color: 'var(--gold)' }}>
                        {bestMatch.count === totalMembers ? `all ${totalMembers} free!` : `${bestMatch.count} of ${totalMembers} free`}
                      </strong>
                    </div>
                    {isCreator ? (
                      <button
                        className="pick-btn"
                        type="button"
                        onClick={() => {
                          onLockInDate({
                            date: formatDateISO(bestMatch.date),
                            startH: formatTimeSpan(bestMatch.startHour, bestMatch.startHour).split(' ')[0],
                            endH: formatTimeSpan(bestMatch.endHour, bestMatch.endHour).split(' ')[0]
                          });
                        }}
                      >
                        Pick this date
                      </button>
                    ) : (
                      <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--cream-muted)' }}>Waiting for creator to confirm</div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="date display" style={{ fontSize: '18px' }}>
                      {totalMembers === 0 ? 'Waiting for responses' : 'No common free time'}
                    </div>
                    <div className="who">
                      {totalMembers === 0
                        ? 'Share the room link with your friends to see overlap.'
                        : 'All submitted schedules overlap with busy hours.'}
                    </div>
                  </>
                )}
              </div>

              <div className="options-card">
                <h3>Other options</h3>
                <p className="options-sub">In case the best match doesn't work for everyone.</p>

                {backupOptions.length === 0 ? (
                  <div style={{ color: 'var(--cream-muted)', fontSize: '12.5px', marginBottom: '8px' }}>
                    {totalMembers === 0 ? 'No options yet.' : 'No alternative overlapping dates found.'}
                  </div>
                ) : (
                  backupOptions.map((opt, idx) => {
                    const optDateStr = `${DAY_NAMES_FULL[opt.date.getDay()]}, ${MONTH_NAMES[opt.date.getMonth()]} ${opt.date.getDate()}`;
                    const optTimeRange = formatTimeSpan(opt.startHour, opt.endHour);
                    const isFull = opt.count === totalMembers;
                    const isSelected = selectedBackupDate === optDateStr;
                    const missingText = opt.missingMembers.length > 0
                      ? ` · ${opt.missingMembers.slice(0, 2).join(', ')}${opt.missingMembers.length > 2 ? ' & others' : ''} busy`
                      : '';

                    return (
                      <label key={idx} className={`option-row ${isSelected ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="dateBackupOption"
                          checked={isSelected}
                          onChange={() => setSelectedBackupDate(optDateStr)}
                          disabled={!isCreator}
                        />
                        <div className="option-body">
                          <div className="option-top">
                            <span className="option-date display">{optDateStr}</span>
                            <span className={`option-badge ${isFull ? 'badge-full' : 'badge-partial'}`}>
                              {opt.count} of {totalMembers} free
                            </span>
                          </div>
                          <div className="option-time">{optTimeRange}{missingText}</div>
                        </div>
                      </label>
                    );
                  })
                )}

                {backupOptions.length > 0 && isCreator && (
                  <button
                    className="btn-secondary btn-compact"
                    style={{ width: '100%', marginTop: '6px' }}
                    type="button"
                    onClick={() => {
                      if (!selectedBackupDate) {
                        alert('Please select a backup option radio button first!');
                        return;
                      }
                      // Find the selected backup option
                      const opt = backupOptions.find(o => `${DAY_NAMES_FULL[o.date.getDay()]}, ${MONTH_NAMES[o.date.getMonth()]} ${o.date.getDate()}` === selectedBackupDate);
                      if (opt) {
                        onLockInDate({
                          date: formatDateISO(opt.date),
                          startH: formatTimeSpan(opt.startHour, opt.startHour).split(' ')[0],
                          endH: formatTimeSpan(opt.endHour, opt.endHour).split(' ')[0]
                        });
                      }
                    }}
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
              <span className="status-count-badge">
                {totalMembers} member{totalMembers === 1 ? '' : 's'}
              </span>
            </div>
            {totalMembers === 0 ? (
              <div style={{ color: 'var(--cream-muted)', fontSize: '12.5px' }}>
                No responses yet. Send the room link to your barkada!
              </div>
            ) : (
              <div className="status-list-compact">
                {memberNames.map((name, i) => {
                  const busyCount = (participants[name] || []).length;
                  return (
                    <div key={i} className="status-item">
                      <span className="status-name">
                        <span className="status-dot dot-done"></span>
                        {name}
                      </span>
                      <span className="status-state">
                        {busyCount === 0 ? 'Free all day' : `${busyCount}h busy`}
                      </span>
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
