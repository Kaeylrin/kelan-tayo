import { useState, useEffect, useRef } from 'react';
import { Reveal } from '../shared/Reveal.jsx';

/** Counts up to `value` once it is set. Reduced-motion users get the number straight away. */
function CountUp({ value }) {
  const [shown, setShown] = useState(null);
  const frame = useRef(0);

  useEffect(() => {
    if (value === null) return;
    const target = Number(value) || 0;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      setShown(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value]);

  return shown === null ? '—' : shown.toLocaleString();
}

/**
 * StatsSection — live room stats from supabase.rpc('get_public_stats').
 * Supabase is imported on demand so it stays out of the landing page bundle.
 * Spam filtering happens in the database function, not here.
 */
export function StatsSection() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    import('../../utils/supabaseClient')
      .then(({ supabase }) => supabase.rpc('get_public_stats'))
      .then(({ data }) => { if (!cancelled && data?.[0]) setStats(data[0]); })
      .catch(() => { /* Stats are best-effort. */ });
    return () => { cancelled = true; };
  }, []);

  const items = [
    { label: 'Rooms created', value: stats?.rooms_created },
    { label: 'Plans confirmed', value: stats?.plans_confirmed },
    { label: "Barkada who've joined a room", value: stats?.members_joined },
  ];

  return (
    <section className="stats-section" aria-label="Kelan Tayo in numbers">
      <div className="stats-grid">
        {items.map((item, i) => (
          <Reveal key={item.label} className="stat-card" delay={i * 90}>
            <div className="stat-number display"><CountUp value={stats ? item.value ?? 0 : null} /></div>
            <div className="stat-label">{item.label}</div>
          </Reveal>
        ))}
      </div>
      <p className="stats-note">Counted straight from real rooms. Updated live.</p>
    </section>
  );
}
