import { describe, it, expect } from 'vitest';
import { computeFreeOverlap } from './scheduler.js';

describe('computeFreeOverlap', () => {
  it('returns null if there are no participants', () => {
    const dates = [new Date('2026-09-08')];
    const result = computeFreeOverlap(dates, {});
    
    expect(result.bestMatch).toBeNull();
    expect(result.backupOptions).toEqual([]);
  });

  it('finds the best match when all members are free all day', () => {
    const d1 = new Date('2026-09-08T00:00:00');
    const dates = [d1];
    const participants = {
      "Alice": [], // free all day
      "Bob": [] // free all day
    };

    const result = computeFreeOverlap(dates, participants);
    
    expect(result.bestMatch).not.toBeNull();
    expect(result.bestMatch.count).toBe(2);
    expect(result.bestMatch.duration).toBe(24);
    expect(result.bestMatch.isAllDay).toBe(true);
    expect(result.bestMatch.freeMembers).toEqual(['Alice', 'Bob']);
  });

  it('correctly ranks partial overlaps', () => {
    const d1 = new Date('2026-09-08T00:00:00');
    const dates = [d1];
    
    // Create busy array for all hours except specific free ones
    const makeBusy = (freeHours) => {
      const busy = [];
      const dStr = '2026-09-08';
      for (let i = 0; i < 24; i++) {
        if (!freeHours.includes(i)) busy.push(`${dStr}_${i}`);
      }
      return busy;
    };

    // Alice free 10-14
    const aliceBusy = makeBusy([10, 11, 12, 13]);
    // Bob free 10-12
    const bobBusy = makeBusy([10, 11]);

    const participants = {
      "Alice": aliceBusy,
      "Bob": bobBusy
    };

    const result = computeFreeOverlap(dates, participants);
    
    // The best match should be 10-12 (count: 2)
    expect(result.bestMatch).not.toBeNull();
    expect(result.bestMatch.startHour).toBe(10);
    expect(result.bestMatch.endHour).toBe(12);
    expect(result.bestMatch.count).toBe(2);
    expect(result.bestMatch.duration).toBe(2);

    // The backup should be 12-14 for Alice (count: 1)
    expect(result.backupOptions.length).toBeGreaterThan(0);
    const backup = result.backupOptions[0];
    expect(backup.startHour).toBe(12);
    expect(backup.endHour).toBe(14);
    expect(backup.count).toBe(1);
    expect(backup.freeMembers).toEqual(['Alice']);
  });
});
