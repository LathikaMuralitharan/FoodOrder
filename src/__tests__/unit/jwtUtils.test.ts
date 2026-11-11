import { describe, it, expect } from 'vitest';
import { jwtUtils } from '../../utils/jwtUtils';

function createToken(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa('mock-sig');
  return `${header}.${body}.${sig}`;
}

describe('jwtUtils.isTokenValid', () => {
  it('returns true for valid unexpired token', () => {
    const token = createToken({
      sub: 'u1', name: 'Jane', email: 'jane@test.com', phone: '5551234567',
      createdAt: '2024-01-01T00:00:00Z',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    expect(jwtUtils.isTokenValid(token)).toBe(true);
  });

  it('returns false for expired token', () => {
    const token = createToken({
      sub: 'u1', exp: Math.floor(Date.now() / 1000) - 100,
    });
    expect(jwtUtils.isTokenValid(token)).toBe(false);
  });

  it('returns false for malformed string (not 3 segments)', () => {
    expect(jwtUtils.isTokenValid('not-a-token')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(jwtUtils.isTokenValid('')).toBe(false);
  });

  it('returns false for corrupted base64', () => {
    expect(jwtUtils.isTokenValid('header.!!!.signature')).toBe(false);
  });

  it('returns false for token without exp claim', () => {
    const token = createToken({ sub: 'u1', name: 'Jane' });
    expect(jwtUtils.isTokenValid(token)).toBe(false);
  });
});

describe('jwtUtils.decodeUser', () => {
  it('returns correct User fields', () => {
    const token = createToken({
      sub: 'u1', name: 'Jane Doe', email: 'jane@test.com', phone: '5551234567',
      createdAt: '2024-01-15T10:00:00Z',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    const user = jwtUtils.decodeUser(token);
    expect(user).not.toBeNull();
    expect(user?.id).toBe('u1');
    expect(user?.name).toBe('Jane Doe');
    expect(user?.email).toBe('jane@test.com');
    expect(user?.phone).toBe('5551234567');
  });

  it('returns null for malformed token', () => {
    expect(jwtUtils.decodeUser('bad')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(jwtUtils.decodeUser('')).toBeNull();
  });
});
