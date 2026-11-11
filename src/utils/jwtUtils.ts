import type { User } from '../types';

interface JwtPayload {
  sub?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  exp?: number;
  iat?: number;
}

function decodeBase64(str: string): string {
  // Handle URL-safe base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return atob(padded);
}

export const jwtUtils = {
  isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(decodeBase64(parts[1])) as JwtPayload;
      if (!payload.exp) return false;
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  decodeUser(token: string): User | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(decodeBase64(parts[1])) as JwtPayload;
      return {
        id: payload.sub ?? payload.id ?? '',
        name: payload.name ?? '',
        email: payload.email ?? '',
        phone: payload.phone ?? '',
        createdAt: payload.createdAt ?? new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },
};
