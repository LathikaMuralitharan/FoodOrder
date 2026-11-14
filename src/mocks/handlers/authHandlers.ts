import { http, HttpResponse } from 'msw';
import { mockUsers, type MockUser } from '../data/users';
import type { User, ApiResponse } from '../../types';

function createMockJwt(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    exp: Math.floor(Date.now() / 1000) + 86400 * 7,
    iat: Math.floor(Date.now() / 1000),
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

function stripPassword(user: MockUser): User {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export const authHandlers = [
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string; phone: string };

    const normalizedEmail = (body.email || '').trim().toLowerCase();
    const existing = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return HttpResponse.json(
        { error: 'Email address is already registered.' },
        { status: 409 }
      );
    }

    const newUser: MockUser = {
      id: `u${Date.now()}`,
      name: body.name.trim(),
      email: normalizedEmail,
      phone: body.phone.trim(),
      password: body.password,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);

    const user = stripPassword(newUser);
    const token = createMockJwt(user);
    return HttpResponse.json<ApiResponse<{ user: User; token: string }>>(
      { data: { user, token } },
      { status: 201 }
    );
  }),

  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const normalizedEmail = (body.email || '').trim().toLowerCase();

    const user = mockUsers.find(
      u => u.email.toLowerCase() === normalizedEmail && u.password === body.password
    );
    if (!user) {
      return HttpResponse.json(
        { error: 'Email or password is incorrect.' },
        { status: 401 }
      );
    }

    const userWithoutPassword = stripPassword(user);
    const token = createMockJwt(userWithoutPassword);
    return HttpResponse.json<ApiResponse<{ user: User; token: string }>>(
      { data: { user: userWithoutPassword, token } },
      { status: 200 }
    );
  }),
];
