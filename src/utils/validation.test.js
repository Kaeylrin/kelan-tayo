import { describe, it, expect } from 'vitest';
import { isValidEmail } from './validation.js';

describe('isValidEmail', () => {
  it('accepts normal addresses, including ones with the letter s', () => {
    expect(isValidEmail('arle.kaeyls@gmail.com')).toBe(true);
    expect(isValidEmail('sss@sss.ss')).toBe(true);
    expect(isValidEmail('juan+gala@school.edu.ph')).toBe(true);
  });

  it('rejects missing parts, spaces and overly long input', () => {
    expect(isValidEmail('juan@gmail')).toBe(false);
    expect(isValidEmail('juan gmail.com')).toBe(false);
    expect(isValidEmail('juan @gmail.com')).toBe(false);
    expect(isValidEmail('@gmail.com')).toBe(false);
    expect(isValidEmail(`${'a'.repeat(250)}@b.co`)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});
