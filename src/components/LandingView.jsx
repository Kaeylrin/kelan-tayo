import React, { useMemo } from 'react';
import { formatPrettyDate } from '../utils/storage.js';

export function LandingView({
  currentRoom,
  creatorName,
  setCreatorName,
  planName,
  setPlanName,
  preset,
  handlePresetChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  joinCode,
  setJoinCode,
  handleCreatePlan,
  handleJoinPlan,
  handleLeaveRoom,
  goToMark,
  goToDash
}) {
  const datesText = useMemo(() => {
    if (!currentRoom) return '';
    const startStr = currentRoom.startDate || currentRoom.date_from;
    const endStr = currentRoom.endDate || currentRoom.date_to;
    if (!startStr || !endStr) return '';
    const s = new Date(startStr + 'T00:00:00');
    const e = new Date(endStr + 'T00:00:00');
    return `${formatPrettyDate(s)} – ${formatPrettyDate(e)}`;
  }, [currentRoom]);

  const responseCount = currentRoom ? currentRoom.participantCount || 0 : 0;

  return (
    <div className="view-content landing-grid-layout">
      <div className="hero">
        <span className="eyebrow">para hindi na tayo mag drawing</span>
        <h1 className="display">Find the day everyone's actually free.</h1>
        <p>
          Stop guessing across endless group chat messages. Mark when you have classes, shifts, or plans — Kelan Tayo finds the dates where nobody is busy.
        </p>

        {/* Active Room Card if present */}
        {currentRoom && (
          <div className="current-room-card" style={{ marginTop: '16px' }}>
            <div className="room-card-header">
              <span className="room-card-badge">Active Plan</span>
              <button className="btn-leave-room" onClick={handleLeaveRoom} type="button">
                Switch / Leave
              </button>
            </div>
            <h2 className="display room-card-title">{currentRoom.name}</h2>
            <div className="room-card-meta">
              <span>Room Code: <strong>{currentRoom.room_code || currentRoom.code}</strong></span>
              <span>Dates: {datesText}</span>
              <span>{responseCount} member{responseCount === 1 ? '' : 's'} submitted schedule</span>
            </div>
            <div className="room-card-actions">
              <button className="btn-primary" onClick={goToMark}>Mark Schedule</button>
              <button className="btn-secondary" onClick={goToDash}>View Dashboard</button>
            </div>
          </div>
        )}
      </div>

      <div className="landing-cards-container">
        {/* Create Plan Card */}
        <div className="create-card">
          <form onSubmit={handleCreatePlan}>
            <label className="field-label" htmlFor="creatorNameInput">Your Name</label>
            <input
              className="field"
              id="creatorNameInput"
              placeholder="e.g. Juan Dela Cruz"
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              required
              autoComplete="off"
            />

            <label className="field-label" htmlFor="planNameInput">Plan name</label>
            <input
              className="field"
              id="planNameInput"
              placeholder="e.g. Beach trip with the barkada"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
              autoComplete="off"
            />

            <label className="field-label">Dates to check</label>
            <div className="preset-row">
              <button
                className={`preset-btn ${preset === '7' ? 'active' : ''}`}
                type="button"
                onClick={() => handlePresetChange('7')}
              >
                Next 7 days
              </button>
              <button
                className={`preset-btn ${preset === '14' ? 'active' : ''}`}
                type="button"
                onClick={() => handlePresetChange('14')}
              >
                Next 2 weeks
              </button>
              <button
                className={`preset-btn ${preset === 'custom' ? 'active' : ''}`}
                type="button"
                onClick={() => handlePresetChange('custom')}
              >
                Custom
              </button>
            </div>

            <div className="date-range-row">
              <div className="date-range-field">
                <label className="field-label" style={{ marginBottom: '3px' }}>From</label>
                <input
                  className="field"
                  type="date"
                  style={{ marginBottom: 0 }}
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPreset('custom');
                  }}
                  required
                />
              </div>
              <div className="date-range-field">
                <label className="field-label" style={{ marginBottom: '3px' }}>To</label>
                <input
                  className="field"
                  type="date"
                  style={{ marginBottom: 0 }}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPreset('custom');
                  }}
                  required
                />
              </div>
            </div>

            <button className="btn-primary" style={{ marginTop: '12px' }} type="submit">
              Create plan &amp; get link
            </button>
          </form>

          <div className="divider-text">or join one already made</div>

          <form className="join-row" onSubmit={handleJoinPlan}>
            <input
              className="field"
              placeholder="Enter room code"
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              autoComplete="off"
              required
            />
            <button className="btn-secondary" type="submit">Join</button>
          </form>
        </div>
      </div>
    </div>
  );
}
