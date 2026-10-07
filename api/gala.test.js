import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory stand-in for the Supabase admin client: just enough query
// builder for api/gala.js.
const db = {};
const users = { 'token-owner': 'owner', 'token-member': 'member', 'token-stranger': 'stranger' };
let nextId = 1;

function query(table) {
  const filters = [];
  let op = 'select';
  let payload = null;
  let head = false;
  let embedProfiles = false;

  const rows = () => (db[table] ||= []);
  const matches = (r) => filters.every((f) => f(r));
  const shape = (r) => (embedProfiles ? { ...r, profiles: (db.profiles || []).find((p) => p.id === r.profile_id) || null } : r);

  const run = () => {
    if (op === 'insert') {
      const list = (Array.isArray(payload) ? payload : [payload]).map((r) => ({ id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`, ...r }));
      rows().push(...list);
      return { data: list, error: null };
    }
    if (op === 'update') {
      const hit = rows().filter(matches);
      hit.forEach((r) => Object.assign(r, payload));
      return { data: hit, error: null };
    }
    if (op === 'delete') {
      db[table] = rows().filter((r) => !matches(r));
      return { data: null, error: null };
    }
    const hit = rows().filter(matches).map(shape);
    return head ? { count: hit.length, data: null, error: null } : { data: hit, error: null };
  };

  const builder = {
    select(cols = '*', opts = {}) {
      if (op === 'select') { head = Boolean(opts.head); embedProfiles = String(cols).includes('profiles('); }
      return builder;
    },
    insert(rowsIn) { op = 'insert'; payload = rowsIn; return builder; },
    update(values) { op = 'update'; payload = values; return builder; },
    delete() { op = 'delete'; return builder; },
    eq(col, val) { filters.push((r) => r[col] === val); return builder; },
    in(col, vals) { filters.push((r) => vals.includes(r[col])); return builder; },
    gte() { return builder; },
    lt() { return builder; },
    order() { return builder; },
    maybeSingle() { const r = run(); return Promise.resolve({ data: r.data?.[0] ?? null, error: null }); },
    single() { const r = run(); return Promise.resolve({ data: r.data?.[0] ?? null, error: r.data?.[0] ? null : { code: 'PGRST116' } }); },
    then(resolve, reject) { return Promise.resolve(run()).then(resolve, reject); },
  };
  return builder;
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: query,
    auth: {
      getUser: async (token) => (users[token]
        ? { data: { user: { id: users[token], email: `${users[token]}@example.com` } }, error: null }
        : { data: { user: null }, error: { message: 'bad token' } }),
    },
  }),
}));

const { default: handler } = await import('./gala.js');

const GALA = '0b2d3f4a-1111-4222-8333-444455556666';

function call(token, body) {
  const res = { statusCode: 0, body: null, setHeader() {} };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (b) => { res.body = b; return res; };
  const req = {
    method: 'POST',
    headers: { host: 'kelan-tayo.vercel.app', origin: 'https://kelan-tayo.vercel.app', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body,
  };
  return handler(req, res).then(() => res);
}

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service');
  for (const k of Object.keys(db)) delete db[k];
  db.regular_galas = [{ id: GALA, name: 'Badminton', created_by: 'owner', start_date: '2026-10-01', end_date: null, status: 'pending', is_paused: false, confirmed_days: null }];
  db.gala_members = [
    { id: 'm1', gala_id: GALA, profile_id: 'owner', is_paused: false, joined_at: '2026-10-01' },
    { id: 'm2', gala_id: GALA, profile_id: 'member', is_paused: false, joined_at: '2026-10-02' },
  ];
  db.profiles = [
    { id: 'owner', email: 'owner@example.com', display_name: 'Owner' },
    { id: 'member', email: 'member@example.com', display_name: 'Member' },
  ];
  db.gala_patterns = [{ id: 'p1', gala_id: GALA, profile_id: 'member', weekday: 5, busy_hours: [9] }];
  db.gala_exceptions = [];
});

describe('api/gala', () => {
  it('requires a signed-in session and a known action', async () => {
    expect((await call(null, { action: 'list' })).statusCode).toBe(401);
    expect((await call('nope', { action: 'list' })).statusCode).toBe(401);
    expect((await call('token-owner', { action: 'dropTables' })).statusCode).toBe(400);
  });

  it('creates a profile on first use without exposing other emails', async () => {
    const res = await call('token-stranger', { action: 'load', galaId: GALA });
    expect(res.statusCode).toBe(200);
    expect(db.profiles.some((p) => p.id === 'stranger')).toBe(true);
    expect(res.body.isMember).toBe(false);
    expect(res.body.patterns).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('member@example.com');
  });

  it('lets members see schedules, with names but no emails', async () => {
    const res = await call('token-member', { action: 'load', galaId: GALA });
    expect(res.body.members.map((m) => m.display_name)).toEqual(['Owner', 'Member']);
    expect(res.body.patterns).toHaveLength(1);
    expect(JSON.stringify(res.body.members)).not.toContain('@');
  });

  it('only lets the owner confirm, pause or delete', async () => {
    const days = [{ weekday: 5, startHour: 14, endHour: 16 }];
    expect((await call('token-member', { action: 'confirm', galaId: GALA, days })).statusCode).toBe(403);
    expect((await call('token-member', { action: 'pauseGala', galaId: GALA, paused: true })).statusCode).toBe(403);
    expect((await call('token-member', { action: 'remove', galaId: GALA })).statusCode).toBe(403);
    const ok = await call('token-owner', { action: 'confirm', galaId: GALA, days });
    expect(ok.statusCode).toBe(200);
    expect(ok.body.gala).toMatchObject({ status: 'confirmed', confirmed_days: days });
  });

  it('validates confirmed days', async () => {
    const bad = (days) => call('token-owner', { action: 'confirm', galaId: GALA, days }).then((r) => r.statusCode);
    expect(await bad([])).toBe(400);
    expect(await bad([{ weekday: 7, startHour: 1, endHour: 2 }])).toBe(400);
    expect(await bad([{ weekday: 1, startHour: 5, endHour: 2 }])).toBe(400);
    expect(await bad([{ weekday: 1, startHour: 1, endHour: 2 }, { weekday: 1, startHour: 3, endHour: 4 }])).toBe(400);
  });

  it('keeps gala-wide exceptions owner-only and dates inside the gala', async () => {
    const base = { action: 'addException', galaId: GALA, date: '2026-10-17', type: 'skip' };
    expect((await call('token-member', { ...base, scope: 'gala' })).statusCode).toBe(403);
    expect((await call('token-member', { ...base, scope: 'me' })).statusCode).toBe(200);
    expect((await call('token-owner', { ...base, scope: 'gala', date: '2026-09-01' })).statusCode).toBe(400);
    expect((await call('token-stranger', { ...base, scope: 'me' })).statusCode).toBe(403);
    expect(db.gala_exceptions).toEqual([expect.objectContaining({ profile_id: 'member', type: 'skip' })]);

    expect((await call('token-owner', { ...base, scope: 'gala', type: 'add', date: '2026-10-21' })).statusCode).toBe(200);
    const memberEx = db.gala_exceptions.find((e) => e.profile_id === 'member');
    const galaEx = db.gala_exceptions.find((e) => e.profile_id === null);
    expect((await call('token-member', { action: 'deleteException', exceptionId: galaEx.id })).statusCode).toBe(403);
    expect((await call('token-owner', { action: 'deleteException', exceptionId: memberEx.id })).statusCode).toBe(200);
    expect(db.gala_exceptions).toEqual([galaEx]);
  });

  it('saves all seven weekdays and rejects bad hours', async () => {
    const patterns = { 0: [1, 2, 2], 5: [9, 10] };
    expect((await call('token-member', { action: 'savePatterns', galaId: GALA, patterns })).statusCode).toBe(200);
    const mine = db.gala_patterns.filter((p) => p.profile_id === 'member');
    expect(mine).toHaveLength(7);
    expect(mine.find((p) => p.weekday === 0).busy_hours).toEqual([1, 2]);
    expect(mine.find((p) => p.weekday === 5).busy_hours).toEqual([9, 10]);
    expect((await call('token-member', { action: 'savePatterns', galaId: GALA, patterns: { 0: [24] } })).statusCode).toBe(400);
    expect((await call('token-stranger', { action: 'savePatterns', galaId: GALA, patterns: {} })).statusCode).toBe(403);
  });

  it('stops owners leaving and lets members leave cleanly', async () => {
    expect((await call('token-owner', { action: 'leave', galaId: GALA })).statusCode).toBe(409);
    expect((await call('token-member', { action: 'leave', galaId: GALA })).statusCode).toBe(200);
    expect(db.gala_members.map((m) => m.profile_id)).toEqual(['owner']);
    expect(db.gala_patterns.some((p) => p.profile_id === 'member')).toBe(false);
  });
});
