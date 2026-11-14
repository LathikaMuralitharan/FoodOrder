import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
}

export type SafeUser = Omit<ServerUser, 'password'>;

const SEED_USERS: ServerUser[] = [
  {
    id: 'u1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '5551234567',
    password: 'password123',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '5559876543',
    password: 'password456',
    createdAt: '2024-02-20T14:30:00Z',
  },
];

const TMP_FILE = path.join(os.tmpdir(), 'food_order_users.json');

function loadUsers(): ServerUser[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fall back to seed users if file read fails
  }
  return [...SEED_USERS];
}

function persistUsers(users: ServerUser[]): void {
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // Best-effort persistence in serverless environments
  }
}

let inMemoryUsers: ServerUser[] = loadUsers();

export function findUserByEmail(email: string): ServerUser | undefined {
  const normalized = (email || '').trim().toLowerCase();
  inMemoryUsers = loadUsers();
  return inMemoryUsers.find(
    (u) => (u.email || '').trim().toLowerCase() === normalized
  );
}

export function createUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): ServerUser {
  inMemoryUsers = loadUsers();
  const newUser: ServerUser = {
    id: `u${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    password: data.password,
    createdAt: new Date().toISOString(),
  };

  inMemoryUsers.push(newUser);
  persistUsers(inMemoryUsers);
  return newUser;
}

export function stripPassword(user: ServerUser): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function createJwtToken(user: SafeUser): string {
  const secret = process.env.JWT_SECRET || 'food-order-secure-jwt-secret-key-2026';

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    iat: nowInSeconds,
    exp: nowInSeconds + 7 * 24 * 60 * 60, // 7 days
  };

  const base64UrlEncode = (str: string): string =>
    Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(tokenData)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${tokenData}.${signature}`;
}
