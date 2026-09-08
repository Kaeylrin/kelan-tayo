import { STORAGE_PREFIX, LAST_ROOM_KEY } from '../constants/config.js';

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

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 3; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const num = Math.floor(100 + Math.random() * 900);
  return `KLTY-${rand}${num}`;
}

export function saveRoomToStorage(room) {
  try {
    localStorage.setItem(STORAGE_PREFIX + room.code, JSON.stringify(room));
    localStorage.setItem(LAST_ROOM_KEY, room.code);
  } catch (err) {
    console.error('Failed saving room to localStorage:', err);
  }
}

export function loadRoomFromStorage(code) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + code);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed reading room from localStorage:', err);
    return null;
  }
}

export function getRoomFromStorage(code) {
  return loadRoomFromStorage(code);
}

export function getLastActiveRoomCode() {
  try {
    return localStorage.getItem(LAST_ROOM_KEY);
  } catch (err) {
    return null;
  }
}
