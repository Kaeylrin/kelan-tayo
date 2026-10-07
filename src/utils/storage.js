export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatPrettyDate(dateObj) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}

export function formatHour(h) {
  if (h === 0) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h === 24) return '11:59 PM';
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}

export function formatTimeSpan(startH, endH) {
  if (startH === 0 && endH === 24) {
    return 'All day (12:00 AM – 11:59 PM)';
  }
  return `${formatHour(startH)} – ${formatHour(endH)}`;
}

export function getDatesArray(startDateStr, endDateStr) {
  const dates = [];
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }
  const curr = new Date(start);
  while (curr <= end) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

/** Hour index (0-24) → "HH:MM" for the API. 24 means end of day. */
export function hourToClock(h) {
  if (h >= 24) return '23:59';
  return `${String(h).padStart(2, '0')}:00`;
}

/** "14:00" or "14:00:00" → "2:00 PM". */
export function formatClock(value) {
  if (!value) return '';
  const [hStr, mStr = '00'] = String(value).split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return String(value);
  const suffix = h >= 12 && h < 24 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr.slice(0, 2)} ${suffix}`;
}

/**
 * Scrolls a schedule grid so the row marked data-scroll-anchor sits just
 * below the sticky day header. Uses layout rects, so it works no matter
 * which ancestor is positioned.
 */
export function scrollGridToAnchor(container) {
  const anchor = container?.querySelector('[data-scroll-anchor="true"]');
  if (!anchor) return;
  const header = container.querySelector('.day-head');
  const offset = anchor.getBoundingClientRect().top - container.getBoundingClientRect().top;
  container.scrollTop = container.scrollTop + offset - (header?.offsetHeight || 0) - 4;
}
