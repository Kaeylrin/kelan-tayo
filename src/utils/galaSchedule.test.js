import { describe, it, expect } from 'vitest';
import {
  computeWeeklyOverlap, findBestWindows, getUpcomingSessions, toGalaWeekday, formatWindow,
} from './galaSchedule.js';

const members = [
  { profile_id: 'a', is_paused: false },
  { profile_id: 'b', is_paused: false },
  { profile_id: 'c', is_paused: true },
];

describe('computeWeeklyOverlap', () => {
  it('returns null when nobody active has a schedule', () => {
    expect(computeWeeklyOverlap([], members)).toBeNull();
    expect(computeWeeklyOverlap([{ profile_id: 'c', weekday: 0, busy_hours: [] }], members)).toBeNull();
  });

  it('counts free members per slot and ignores paused members', () => {
    const overlap = computeWeeklyOverlap([
      { profile_id: 'a', weekday: 5, busy_hours: [9, 10] },
      { profile_id: 'b', weekday: 5, busy_hours: [10] },
      { profile_id: 'c', weekday: 5, busy_hours: [] },
    ], members);
    expect(overlap.participantIds).toEqual(['a', 'b']);
    expect(overlap.freeCounts[5][8]).toBe(2);
    expect(overlap.freeCounts[5][9]).toBe(1);
    expect(overlap.freeCounts[5][10]).toBe(0);
    expect(overlap.freeBySlot[5][9]).toEqual(['b']);
  });
});

describe('findBestWindows', () => {
  it('picks the longest run at the day peak and ranks by people free', () => {
    const allBusyExcept = (free) => Array.from({ length: 24 }, (_, h) => h).filter((h) => !free.includes(h));
    const overlap = computeWeeklyOverlap([
      { profile_id: 'a', weekday: 5, busy_hours: allBusyExcept([8, 14, 15, 16]) },
      { profile_id: 'b', weekday: 5, busy_hours: allBusyExcept([8, 14, 15, 16]) },
      { profile_id: 'a', weekday: 1, busy_hours: allBusyExcept([18, 19]) },
      { profile_id: 'b', weekday: 1, busy_hours: [] },
      ...[0, 2, 3, 4, 6].flatMap((d) => [
        { profile_id: 'a', weekday: d, busy_hours: allBusyExcept([]) },
        { profile_id: 'b', weekday: d, busy_hours: allBusyExcept([]) },
      ]),
    ], members);
    const windows = findBestWindows(overlap);
    expect(windows).toHaveLength(2);
    expect(windows[0]).toMatchObject({ day: 5, startHour: 14, endHour: 16, freeCount: 2, pct: 100 });
    expect(windows[1]).toMatchObject({ day: 1, startHour: 18, endHour: 19, freeCount: 2 });
    expect(formatWindow(14, 16)).toBe('2pm–5pm');
  });
});

describe('getUpcomingSessions', () => {
  const gala = {
    status: 'confirmed',
    is_paused: false,
    start_date: '2026-10-01',
    end_date: null,
    confirmed_days: [{ weekday: 5, startHour: 14, endHour: 16 }], // Saturdays
  };

  it('repeats the confirmed day every week from the start date', () => {
    const sessions = getUpcomingSessions(gala, [], { from: new Date(2026, 9, 5), count: 3 });
    expect(sessions.map((s) => s.date)).toEqual(['2026-10-10', '2026-10-17', '2026-10-24']);
    expect(sessions.every((s) => s.status === 'on')).toBe(true);
    expect(toGalaWeekday(new Date(2026, 9, 10))).toBe(5);
  });

  it('applies skip, add and personal exceptions for that date only', () => {
    const sessions = getUpcomingSessions(gala, [
      { profile_id: null, date: '2026-10-17', type: 'skip', note: 'Holiday' },
      { profile_id: null, date: '2026-10-21', type: 'add', note: null },
      { profile_id: 'a', display_name: 'Mika', date: '2026-10-24', type: 'skip' },
    ], { from: new Date(2026, 9, 5), count: 4 });
    expect(sessions.map((s) => [s.date, s.status])).toEqual([
      ['2026-10-10', 'on'],
      ['2026-10-17', 'skipped'],
      ['2026-10-21', 'extra'],
      ['2026-10-24', 'on'],
    ]);
    expect(sessions[1].note).toBe('Holiday');
    expect(sessions[3].out).toEqual(['Mika']);
  });

  it('returns nothing when paused, unconfirmed, or past the end date', () => {
    expect(getUpcomingSessions({ ...gala, is_paused: true }, [])).toEqual([]);
    expect(getUpcomingSessions({ ...gala, status: 'pending' }, [])).toEqual([]);
    expect(getUpcomingSessions({ ...gala, end_date: '2026-10-12' }, [], { from: new Date(2026, 9, 5) })).toHaveLength(1);
  });
});
