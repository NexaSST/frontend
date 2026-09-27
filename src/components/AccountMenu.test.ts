import { describe, expect, it } from 'vitest';
import { accountInitials } from './AccountMenu.js';
import type { Session } from '../lib/session.js';

describe('accountInitials', () => {
  it('uses the first and last words of a company user name', () => {
    expect(accountInitials({ kind: 'company', email: 'other@example.com', identity: { name: 'Padilha Matheus' } } as Session)).toBe('PM');
  });

  it('uses the email identifier for platform accounts', () => {
    expect(accountInitials({ kind: 'platform', email: 'padilha.matheus@hotmail.com' } as Session)).toBe('PM');
  });
});
