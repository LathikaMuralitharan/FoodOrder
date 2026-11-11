import { describe, it, expect } from 'vitest';
import { storageUtils } from '../../utils/storageUtils';
import { jwtUtils } from '../../utils/jwtUtils';

describe('Auth Integration', () => {
  it('stores and retrieves token from localStorage', () => {
    localStorage.clear();
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1MSIsImV4cCI6OTk5OTk5OTk5OX0.sig';
    storageUtils.saveToken(token);
    expect(storageUtils.loadToken()).toBe(token);
    storageUtils.clearToken();
    expect(storageUtils.loadToken()).toBeNull();
  });

  it('treats valid JWT as authenticated', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'u1', name: 'Jane', email: 'jane@test.com', phone: '5551234567',
      createdAt: '2024-01-01T00:00:00Z',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    const token = `${header}.${payload}.sig`;
    expect(jwtUtils.isTokenValid(token)).toBe(true);
    const user = jwtUtils.decodeUser(token);
    expect(user?.id).toBe('u1');
  });

  it('clears invalid token from storage', () => {
    storageUtils.saveToken('invalid-token');
    expect(storageUtils.loadToken()).toBe('invalid-token');
    expect(jwtUtils.isTokenValid('invalid-token')).toBe(false);
    storageUtils.clearToken();
    expect(storageUtils.loadToken()).toBeNull();
  });
});
