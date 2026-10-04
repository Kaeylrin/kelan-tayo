import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  ApiError, assertPostFromSite, cleanText, assertUuid, assertDate, optionalTime,
  verifyTurnstile, rateLimit, withGuard,
} from './guard.js';

const req = (headers = {}, body = {}, method = 'POST') => ({ method, headers: { host: 'kelan-tayo.vercel.app', ...headers }, body });

function mockRes() {
  const res = { headers: {}, statusCode: 0, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('assertPostFromSite', () => {
  it('accepts same-site and preview origins', () => {
    expect(() => assertPostFromSite(req({ origin: 'https://kelan-tayo.vercel.app' }))).not.toThrow();
    expect(() => assertPostFromSite(req({ origin: 'https://kelan-tayo-git-main-x.vercel.app' }))).not.toThrow();
    expect(() => assertPostFromSite(req({ origin: 'http://localhost:5173', host: 'localhost:5173' }))).not.toThrow();
  });

  it('rejects other origins, missing origin and non-POST', () => {
    expect(() => assertPostFromSite(req({ origin: 'https://evil.example' }))).toThrow(ApiError);
    expect(() => assertPostFromSite(req({}))).toThrow(/origin/);
    expect(() => assertPostFromSite(req({ origin: 'https://kelan-tayo.vercel.app' }, {}, 'GET'))).toThrow(/Method/);
  });
});

describe('input validation', () => {
  it('cleanText strips control/invisible characters and enforces length', () => {
    expect(cleanText('  Juan​  Dela\nCruz ', 40, 'Name')).toBe('Juan Dela Cruz');
    expect(() => cleanText('​​', 40, 'Name')).toThrow(/required/);
    expect(() => cleanText('x'.repeat(41), 40, 'Name')).toThrow(/40 characters/);
    expect(() => cleanText(123, 40, 'Name')).toThrow(/required/);
  });

  it('validates uuids, dates and times', () => {
    expect(assertUuid('0b6f5a3e-2c1d-4e5f-8a9b-1c2d3e4f5a6b', 'room')).toBeTruthy();
    expect(() => assertUuid('1 or 1=1', 'room')).toThrow();
    expect(assertDate('2026-10-04', 'date')).toBe('2026-10-04');
    expect(() => assertDate('2026-13-45', 'date')).toThrow();
    expect(optionalTime('', 'time')).toBeNull();
    expect(optionalTime('24:00', 'time')).toBe('24:00');
    expect(() => optionalTime('25:00', 'time')).toThrow();
  });
});

describe('verifyTurnstile', () => {
  it('fails closed when the secret is not configured', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    await expect(verifyTurnstile('token', '1.1.1.1')).rejects.toThrow(/configuration/);
  });

  it('rejects missing tokens and failed verifications', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'secret');
    await expect(verifyTurnstile('', '1.1.1.1')).rejects.toThrow(/missing/);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve({ success: false }) }));
    await expect(verifyTurnstile('token', '1.1.1.1')).rejects.toThrow(/failed/);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve({ success: true }) }));
    await expect(verifyTurnstile('token', '1.1.1.1')).resolves.toBeUndefined();
  });
});

describe('rateLimit', () => {
  const fakeDb = (count, error = null) => {
    const insert = vi.fn().mockResolvedValue({});
    const query = { select: () => query, eq: () => query, gte: () => Promise.resolve({ count, error }) };
    const del = () => ({ lt: () => Promise.resolve({}) });
    return { insert, from: () => ({ ...query, insert, delete: del }) };
  };

  it('blocks once the limit is reached and logs otherwise', async () => {
    await expect(rateLimit(fakeDb(5), '1.1.1.1', 'a', 5, 60)).rejects.toThrow(/Too many/);
    const db = fakeDb(2);
    await rateLimit(db, '1.1.1.1', 'a', 5, 60);
    expect(db.insert).toHaveBeenCalledWith({ ip_hash: expect.stringMatching(/^[0-9a-f]{64}$/), action: 'a' });
  });

  it('fails open if the table does not exist yet', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(rateLimit(fakeDb(null, { message: 'missing' }), '1.1.1.1', 'a', 5, 60)).resolves.toBeUndefined();
  });
});

describe('withGuard', () => {
  it('silently accepts honeypot submissions without running the handler', async () => {
    const handler = vi.fn();
    const res = mockRes();
    await withGuard(handler)(req({}, { website: 'spam' }), res);
    expect(handler).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it('maps ApiError to its status and hides unexpected errors', async () => {
    let res = mockRes();
    await withGuard(() => { throw new ApiError(429, 'slow down'); })(req(), res);
    expect(res).toMatchObject({ statusCode: 429, body: { error: 'slow down' } });

    vi.spyOn(console, 'error').mockImplementation(() => {});
    res = mockRes();
    await withGuard(() => { throw new Error('db password is hunter2'); })(req(), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).not.toMatch(/hunter2/);
  });
});
