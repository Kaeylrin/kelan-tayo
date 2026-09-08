import { formatDateISO } from '../utils/storage.js';

/**
 * Computes Free Overlap, Best Match, and Backup Windows based on Inverted Schedule.
 * Participants object: { "Mika": ["2026-09-08_14", ...] } where array items are BUSY slots.
 * Free slot = slot not in busy list.
 */
export function computeFreeOverlap(dates, participants) {
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
          allWindows.push({
            date: d,
            startHour: currentStart,
            endHour: h, // represents end boundary (e.g. 0 to 24)
            isAllDay: currentStart === 0 && h === 24,
            freeMembers: currentFree,
            missingMembers: memberNames.filter(m => !currentFree.includes(m)),
            count: totalMembers,
            duration: h - currentStart
          });
          currentStart = null;
        }
      }
    }

    if (currentStart !== null) {
      allWindows.push({
        date: d,
        startHour: currentStart,
        endHour: 24,
        isAllDay: currentStart === 0,
        freeMembers: currentFree,
        missingMembers: memberNames.filter(m => !currentFree.includes(m)),
        count: totalMembers,
        duration: 24 - currentStart
      });
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
              allWindows.push({
                date: d,
                startHour: partialStart,
                endHour: h,
                isAllDay: false,
                freeMembers: partialCommon,
                missingMembers: memberNames.filter(m => !partialCommon.includes(m)),
                count: partialCommon.length,
                duration: h - partialStart
              });
            }
            partialStart = h;
            partialCommon = [...slot.free];
          }
        }
      } else {
        if (partialStart !== null && partialCommon.length > 0) {
          allWindows.push({
            date: d,
            startHour: partialStart,
            endHour: h,
            isAllDay: false,
            freeMembers: partialCommon,
            missingMembers: memberNames.filter(m => !partialCommon.includes(m)),
            count: partialCommon.length,
            duration: h - partialStart
          });
          partialStart = null;
        }
      }
    }

    if (partialStart !== null && partialCommon.length > 0) {
      allWindows.push({
        date: d,
        startHour: partialStart,
        endHour: 24,
        isAllDay: false,
        freeMembers: partialCommon,
        missingMembers: memberNames.filter(m => !partialCommon.includes(m)),
        count: partialCommon.length,
        duration: 24 - partialStart
      });
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
