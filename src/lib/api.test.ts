import { describe, expect, it } from 'vitest';
import { readCookie } from './api.js';

describe('readCookie', () => {
  it('reads and decodes the named cookie only', () => {
    expect(readCookie('nexasst_csrf', 'other=x; nexasst_csrf=abc%20123; session=no')).toBe('abc 123');
  });
  it('returns undefined when the cookie is absent', () => {
    expect(readCookie('nexasst_csrf', 'other=x')).toBeUndefined();
  });
});
