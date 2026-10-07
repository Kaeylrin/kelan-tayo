import { useState } from 'react';
import { BotCheck } from './BotCheck.jsx';

export function CreateView({
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
  isSubmitting,
  preferredStart,
  setPreferredStart,
  preferredEnd,
  setPreferredEnd,
  honeypot,
  setHoneypot,
  setTurnstileToken,
  turnstileRef
}) {
  const [preferredPreset, setPreferredPreset] = useState('morning');

  const handlePreferredPreset = (preset) => {
    setPreferredPreset(preset);
    if (preset === 'morning') { setPreferredStart('08:00'); setPreferredEnd('22:00'); }
    else if (preset === 'noon') { setPreferredStart('12:00'); setPreferredEnd('24:00'); }
    else if (preset === 'anytime') { setPreferredStart(null); setPreferredEnd(null); }
    // 'custom' keeps whatever the user types
  };

  return (
    <div className="view-content landing-grid-layout">
      <div className="hero">
        <span className="eyebrow">para hindi na tayo mag drawing</span>
        <h1 className="display">Find the day everyone's actually free.</h1>
        <p>
          Stop guessing across endless group chat messages. Mark when you have classes, shifts, or plans, Kelan Tayo finds the dates where nobody is busy.
        </p>
      </div>

      <div className="landing-cards-container">
        {/* Create Plan Card */}
        <div className="create-card">
          <form onSubmit={handleCreatePlan}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp-field" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            <label className="field-label" htmlFor="creatorNameInput">Your Name</label>
            <input
              className="field"
              id="creatorNameInput"
              placeholder="e.g. Juan Dela Cruz"
              maxLength={40}
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
              maxLength={60}
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
                <label className="field-label field-label-tight">From</label>
                <input
                  className="field"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handlePresetChange('custom');
                  }}
                  required
                />
              </div>
              <div className="date-range-field">
                <label className="field-label field-label-tight">To</label>
                <input
                  className="field"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handlePresetChange('custom');
                  }}
                  required
                />
              </div>
            </div>

            <label className="field-label field-label-spaced">Preferred hours</label>
            <div className="preferred-hours-row">
              <button
                className={`preset-btn ${preferredPreset === 'morning' ? 'active' : ''}`}
                type="button"
                onClick={() => handlePreferredPreset('morning')}
              >
                Morning to Night
              </button>
              <button
                className={`preset-btn ${preferredPreset === 'noon' ? 'active' : ''}`}
                type="button"
                onClick={() => handlePreferredPreset('noon')}
              >
                Noon to Midnight
              </button>
              <button
                className={`preset-btn ${preferredPreset === 'anytime' ? 'active' : ''}`}
                type="button"
                onClick={() => handlePreferredPreset('anytime')}
              >
                Anytime
              </button>
              <button
                className={`preset-btn ${preferredPreset === 'custom' ? 'active' : ''}`}
                type="button"
                onClick={() => handlePreferredPreset('custom')}
              >
                Custom
              </button>
            </div>

            {preferredPreset === 'custom' && (
              <div className="date-range-row date-range-row-spaced">
                <div className="date-range-field">
                  <label className="field-label field-label-tight">From</label>
                  <input
                    className="field"
                    type="time"
                      value={preferredStart || ''}
                    onChange={(e) => setPreferredStart(e.target.value)}
                  />
                </div>
                <div className="date-range-field">
                  <label className="field-label field-label-tight">To</label>
                  <input
                    className="field"
                    type="time"
                      value={preferredEnd || ''}
                    onChange={(e) => setPreferredEnd(e.target.value)}
                  />
                </div>
              </div>
            )}

            <BotCheck ref={turnstileRef} action="create-room" onToken={setTurnstileToken} />

            <button className="btn-primary btn-create" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : <>Create plan &amp; get link</>}
            </button>
          </form>

          <div className="divider-text">or join one already made</div>

          <form className="join-row" onSubmit={handleJoinPlan}>
            <input
              className="field"
              placeholder="Enter room code"
              aria-label="Room code"
              maxLength={20}
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
