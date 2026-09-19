import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

/**
 * StatsSection — live room stats fetched from Supabase on mount.
 * Calls: supabase.rpc('get_public_stats')
 * Shows '—' while loading, then real numbers once resolved.
 */
export function StatsSection() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await supabase.rpc('get_public_stats');
        if (data && data[0]) {
          setStats(data[0]);
        }
      } catch (_err) {
        // Stats are best-effort; silently fail.
      }
    }
    fetchStats();
  }, []);

  const rooms     = stats ? stats.rooms_created   : '—';
  const confirmed = stats ? stats.plans_confirmed  : '—';
  const members   = stats ? stats.members_joined   : '—';

  return (
    <section className="stats-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number display">{rooms}</div>
          <div className="stat-label">Rooms created</div>
        </div>
        <div className="stat-card">
          <div className="stat-number display">{confirmed}</div>
          <div className="stat-label">Plans confirmed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number display">{members}</div>
          <div className="stat-label">Barkada who've joined a room</div>
        </div>
      </div>
      <p className="stats-note">Counted straight from confirmed rooms. Updated live.</p>
    </section>
  );
}
