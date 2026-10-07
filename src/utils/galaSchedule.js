import { formatDateISO } from './storage.js';

// Regular Gala weekdays are stored Monday-first: 0 = Monday … 6 = Sunday.
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** JS Date → Monday-first weekday index. */
export function toGalaWeekday(date) {
  return (date.getDay() + 6) % 7;
}

/** 0 → "12am", 13 → "1pm", 24 → "12am" (end of day). */
export function formatHourShort(h) {
  const hour = h % 24;
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
}

/** Inclusive end hour → "6pm–9pm" style label. */
export function formatWindow(startHour, endHour) {
  return `${formatHourShort(startHour)}–${formatHourShort(endHour + 1)}`;
}

/**
 * Builds a 7×24 free-count grid from members' weekly busy patterns.
 * Only active (not paused) members who have saved a schedule are counted.
 * Returns { freeCounts, participantIds, freeBySlot } or null if nobody counts.
 */
export function computeWeeklyOverlap(patterns, members) {
  const active = new Set((members || []).filter((m) => !m.is_paused).map((m) => m.profile_id));
  const relevant = (patterns || []).filter((p) => active.has(p.profile_id));
  const participantIds = [...new Set(relevant.map((p) => p.profile_id))];
  if (participantIds.length === 0) return null;

  // busy[profile][weekday] = Set of hours
  const busy = new Map(participantIds.map((id) => [id, Array.from({ length: 7 }, () => new Set())]));
  relevant.forEach((p) => {
    if (p.weekday < 0 || p.weekday > 6 || !Array.isArray(p.busy_hours)) return;
    p.busy_hours.forEach((h) => busy.get(p.profile_id)[p.weekday].add(h));
  });

  const freeBySlot = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => participantIds.filter((id) => !busy.get(id)[day].has(hour))),
  );
  const freeCounts = freeBySlot.map((day) => day.map((ids) => ids.length));
  return { freeCounts, participantIds, freeBySlot };
}

/**
 * For each weekday, finds the longest run of hours with that day's highest
 * free count. Returns the windows ranked by people free, then length.
 * Each window: { day, startHour, endHour (inclusive), freeCount, pct }.
 */
export function findBestWindows(overlap, minHours = 1) {
  if (!overlap) return [];
  const total = overlap.participantIds.length;
  const results = [];

  overlap.freeCounts.forEach((hours, day) => {
    const peak = Math.max(...hours);
    if (peak === 0) return;
    let best = null;
    let runStart = null;
    for (let h = 0; h <= 24; h++) {
      const inRun = h < 24 && hours[h] === peak;
      if (inRun && runStart === null) runStart = h;
      if (!inRun && runStart !== null) {
        const length = h - runStart;
        if (!best || length > best.length) best = { startHour: runStart, endHour: h - 1, length };
        runStart = null;
      }
    }
    if (best && best.length >= minHours) {
      results.push({
        day,
        startHour: best.startHour,
        endHour: best.endHour,
        hours: best.length,
        freeCount: peak,
        pct: Math.round((peak / total) * 100),
      });
    }
  });

  return results.sort((a, b) => b.freeCount - a.freeCount || b.hours - a.hours || a.day - b.day);
}

function parseISODate(iso) {
  return new Date(`${iso}T00:00:00`);
}

/**
 * Lists the next `count` gala dates after applying the confirmed weekly
 * pattern, the gala's start/end dates and exceptions.
 * Gala-wide "skip" exceptions mark a regular day as skipped; gala-wide "add"
 * exceptions add an extra session. Personal "skip" exceptions list who is out.
 * Returns [{ date, weekday, startHour, endHour, status: 'on'|'skipped'|'extra', note, out: [names] }].
 */
export function getUpcomingSessions(gala, exceptions, { from = new Date(), count = 6, horizonDays = 180 } = {}) {
  if (!gala || gala.status !== 'confirmed' || gala.is_paused) return [];
  const days = new Map((gala.confirmed_days || []).map((d) => [d.weekday, d]));
  if (days.size === 0) return [];
  const fallback = [...days.values()][0];

  const galaWide = new Map();
  const personalOut = new Map();
  (exceptions || []).forEach((ex) => {
    if (ex.profile_id === null || ex.profile_id === undefined) {
      galaWide.set(ex.date, ex);
    } else if (ex.type === 'skip') {
      if (!personalOut.has(ex.date)) personalOut.set(ex.date, []);
      personalOut.get(ex.date).push(ex.display_name || 'Someone');
    }
  });

  const start = parseISODate(gala.start_date);
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (start > cursor) cursor.setTime(start.getTime());
  const end = gala.end_date ? parseISODate(gala.end_date) : null;

  const sessions = [];
  for (let i = 0; i < horizonDays && sessions.length < count; i++) {
    if (end && cursor > end) break;
    const iso = formatDateISO(cursor);
    const weekday = toGalaWeekday(cursor);
    const regular = days.get(weekday);
    const override = galaWide.get(iso);

    if (regular || override?.type === 'add') {
      const slot = regular || fallback;
      let status = 'on';
      if (override?.type === 'skip' && regular) status = 'skipped';
      else if (override?.type === 'add' && !regular) status = 'extra';
      if (!(override?.type === 'skip' && !regular)) {
        sessions.push({
          date: iso,
          weekday,
          startHour: slot.startHour,
          endHour: slot.endHour,
          status,
          note: override?.note || null,
          out: personalOut.get(iso) || [],
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return sessions;
}
