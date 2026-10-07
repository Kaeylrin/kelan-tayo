// localStorage can throw (private mode, blocked storage), so every access is guarded.

const MEMBERSHIPS_KEY = 'kelan_memberships';

export function readStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function writeStorage(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

export function removeStorage(key) {
  try { localStorage.removeItem(key); } catch { /* storage unavailable */ }
}

function readMemberships() {
  try {
    const parsed = JSON.parse(readStorage(MEMBERSHIPS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** The member id this device joined a room as, if any. */
export function getDeviceMemberId(roomId) {
  return readMemberships()[roomId] || null;
}

export function saveDeviceMemberId(roomId, memberId) {
  const memberships = readMemberships();
  memberships[roomId] = memberId;
  writeStorage(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}

export function forgetDeviceMember(roomId) {
  const memberships = readMemberships();
  delete memberships[roomId];
  writeStorage(MEMBERSHIPS_KEY, JSON.stringify(memberships));
}
