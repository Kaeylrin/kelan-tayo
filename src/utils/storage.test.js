import { describe, it, expect } from 'vitest';
import { hourToClock, formatClock, formatTimeSpan } from './storage.js';

describe('time helpers', () => {
  it('keeps afternoon hours when building API times', () => {
    expect(hourToClock(8)).toBe('08:00');
    expect(hourToClock(20)).toBe('20:00');
    expect(hourToClock(24)).toBe('23:59');
  });

  it('formats stored times in 12-hour format', () => {
    expect(formatClock('20:00:00')).toBe('8:00 PM');
    expect(formatClock('00:30')).toBe('12:30 AM');
    expect(formatClock('12:00')).toBe('12:00 PM');
    expect(formatClock('23:59:00')).toBe('11:59 PM');
  });

  it('describes a whole-day span', () => {
    expect(formatTimeSpan(0, 24)).toBe('All day (12:00 AM – 11:59 PM)');
    expect(formatTimeSpan(18, 21)).toBe('6:00 PM – 9:00 PM');
  });
});
