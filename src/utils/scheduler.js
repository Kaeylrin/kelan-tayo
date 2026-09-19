import { formatDateISO } from '../utils/storage.js';

/**
 * Clips a free span { start, end } to the preferred window [windowStart, windowEnd].
 * Returns null if the clipped span has zero or negative duration.
 * If windowStart/windowEnd are null/undefined, returns the span unchanged (Anytime).
 */
function clipToPreferredWindow(span, windowStart, windowEnd) {
  if (!windowStart || !windowEnd) return span; // Anytime — no clipping
  const ws = parseInt(windowStart.split(':')[0], 10);
  // Handle '24:00' edge case (midnight end)
  const rawWe = windowEnd === '24:00' ? 24 : parseInt(windowEnd.split(':')[0], 10);
  const clippedStart = Math.max(span.start, ws);
  const clippedEnd = Math.min(span.end, rawWe);
  if (clippedStart >= clippedEnd) return null;
  return { ...span, start: clippedStart, end: clippedEnd };
}

/**
 * Computes Free Overlap, Best Match, and Backup Windows based on Inverted Schedule.
 * Participants object: { "Mika": ["2026-09-08_14", ...] } where array items are BUSY slots.
 * Free slot = slot not in busy list.
 * preferredStart / preferredEnd: "HH:MM" strings (or null for Anytime).
 */
export function computeFreeOverlap(dates, participants, preferredStart, preferredEnd) {
  const memberNames = Object.keys(participants || {});
  const totalMembers = memberNames.length;

  if (totalMembers === 0 || dates.length === 0) {
    return { bestMatch: null, backupOptions: [], dayScores: [] };
  }

  const allWindows = [];

  dates.forEach(d => {
    const dStr = formatDateISO(d);
    const hourFreeMap = [];

    for (let h = 0; h < 24; h++) {
      const slotKey = `${dStr}_${h}`;
      const free = memberNames.filter(name => {
        const busy = participants[name] || [];
        return !busy.includes(slotKey);
      });
      hourFreeMap.push({ hour: h, free, count: free.length });
    }

    // Identify maximal contiguous free blocks for various participant groupings
    // 1. Group contiguous hours with uniform full participation
    let currentStart = null;
    let currentFree = [];

    for (let h = 0; h < 24; h++) {
      const slot = hourFreeMap[h];
      const isSlotFull = slot.count === totalMembers;

      if (isSlotFull) {
        if (currentStart === null) {
          currentStart = h;
          currentFree = slot.free;
        }
      } else {
        if (currentStart !== null) {
          const clipped = clipToPreferredWindow(
            { start: currentStart, end: h },
            preferredStart,
            preferredEnd
          );
          if (clipped) {
            allWindows.push({
              date: d,
              startHour: clipped.start,
              endHour: clipped.end,
              isAllDay: clipped.start === 0 && clipped.end === 24,
              freeMembers: currentFree,
              missingMembers: memberNames.filter(m => !currentFree.includes(m)),
              count: totalMembers,
              duration: clipped.end - clipped.start
            });
          }
          currentStart = null;
        }
      }
    }

    if (currentStart !== null) {
      const clipped = clipToPreferredWindow(
        { start: currentStart, end: 24 },
        preferredStart,
        preferredEnd
      );
      if (clipped) {
        allWindows.push({
          date: d,
          startHour: clipped.start,
          endHour: clipped.end,
          isAllDay: clipped.start === 0 && clipped.end === 24,
          freeMembers: currentFree,
          missingMembers: memberNames.filter(m => !currentFree.includes(m)),
          count: totalMembers,
          duration: clipped.end - clipped.start
        });
      }
    }

    // 2. Also check maximal contiguous windows for majority / partial overlap (if not full all day)
    let partialStart = null;
    let partialMinCount = 0;
    let partialCommon = [];

    for (let h = 0; h < 24; h++) {
      const slot = hourFreeMap[h];
      if (slot.count > 0 && slot.count < totalMembers) {
        if (partialStart === null) {
          partialStart = h;
          partialMinCount = slot.count;
          partialCommon = [...slot.free];
        } else {
          const intersection = partialCommon.filter(m => slot.free.includes(m));
          if (intersection.length > 0) {
            partialCommon = intersection;
          } else {
            if (partialCommon.length > 0 && h - partialStart >= 2) {
              const clipped = clipToPreferredWindow(
                { start: partialStart, end: h },
                preferredStart,
                preferredEnd
              );
              if (clipped) {
                allWindows.push({
                  date: d,
                  startHour: clipped.start,
                  endHour: clipped.end,
                  isAllDay: false,
                  freeMembers: partialCommon,
                  missingMembers: memberNames.filter(m => !partialCommon.includes(m)),
                  count: partialCommon.length,
                  duration: clipped.end - clipped.start
                });
              }
            }
            partialStart = h;
            partialCommon = [...slot.free];
          }
        }
      } else {
        if (partialStart !== null && partialCommon.length > 0) {
          const clipped = clipToPreferredWindow(
            { start: partialStart, end: h },
            preferredStart,
            preferredEnd
          );
          if (clipped) {
            allWindows.push({
              date: d,
              startHour: clipped.start,
              endHour: clipped.end,
              isAllDay: false,
              freeMembers: partialCommon,
              missingMembers: memberNames.filter(m => !partialCommon.includes(m)),
              count: partialCommon.length,
              duration: clipped.end - clipped.start
            });
          }
          partialStart = null;
        }
      }
    }

    if (partialStart !== null && partialCommon.length > 0) {
      const clipped = clipToPreferredWindow(
        { start: partialStart, end: 24 },
        preferredStart,
        preferredEnd
      );
      if (clipped) {
        allWindows.push({
          date: d,
          startHour: clipped.start,
          endHour: clipped.end,
          isAllDay: false,
          freeMembers: partialCommon,
          missingMembers: memberNames.filter(m => !partialCommon.includes(m)),
          count: partialCommon.length,
          duration: clipped.end - clipped.start
        });
      }
    }
  });

  // Remove duplicate/overlapping windows for the same date
  const uniqueWindows = [];
  allWindows.forEach(win => {
    const existing = uniqueWindows.find(u => 
      u.date.getTime() === win.date.getTime() && 
      u.startHour === win.startHour && 
      u.endHour === win.endHour &&
      u.count === win.count
    );
    if (!existing) {
      uniqueWindows.push(win);
    }
  });

  // Ranking strategy:
  // 1. Participant count (descending)
  // 2. Full-day bonus / Longer duration (descending)
  // 3. Date chronologically (ascending)
  uniqueWindows.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.duration !== a.duration) return b.duration - a.duration;
    return a.date - b.date;
  });

  return {
    bestMatch: uniqueWindows[0] || null,
    backupOptions: uniqueWindows.slice(1, 6),
    dayScores: uniqueWindows
  };
}

