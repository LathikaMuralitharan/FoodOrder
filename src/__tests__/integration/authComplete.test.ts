import { describe, it, expect, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { authHandlers } from '../../mocks/handlers/authHandlers';
import { validator } from '../../utils/validator';
import { authService } from '../../features/auth/authService';
import { storageUtils } from '../../utils/storageUtils';
import { jwtUtils } from '../../utils/jwtUtils';
import loginHandler from '../../../api/v1/auth/login';
import registerHandler from '../../../api/v1/auth/register';

const server = setupServer(...authHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createMockReqRes(options: {
  method?: string;
  body?: any;
}) {
  const req: any = {
    method: options.method || 'POST',
    body: options.body || {},
    headers: {},
  };

  const res: any = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    },
  };

  return { req, res };
}

describe('Complete Authentication Suite (Local MSW & Vercel Serverless)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Requirement 1 & 2 & 3: Registration Requirements', () => {
    it('1. Test registration with valid information via authService', async () => {
      const uniqueEmail = `newuser_${Date.now()}@example.com`;
      const result = await authService.register({
        name: 'Alice Wonder',
        email: uniqueEmail,
        password: 'password1234',
        phone: '1234567890',
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('Alice Wonder');
      expect(result.user.email).toBe(uniqueEmail);
      expect(result.token).toBeTruthy();
      expect(jwtUtils.isTokenValid(result.token)).toBe(true);
    });

    it('2. Test registration with invalid information fails validator', () => {
      // Short password (< 8 chars)
      const res1 = validator.validateRegistrationForm({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'short',
        phone: '1234567890',
      });
      expect(res1.password.isValid).toBe(false);
      expect(res1.password.error).toContain('between 8 and 128 characters');

      // Invalid phone (!= 10 digits)
      const res2 = validator.validateRegistrationForm({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'validPassword123',
        phone: '12345',
      });
      expect(res2.phone.isValid).toBe(false);
      expect(res2.phone.error).toContain('exactly 10 digits');

      // Invalid email format
      const res3 = validator.validateRegistrationForm({
        name: 'Bob',
        email: 'not-an-email',
        password: 'validPassword123',
        phone: '1234567890',
      });
      expect(res3.email.isValid).toBe(false);
      expect(res3.email.error).toContain('valid email address');
    });

    it('3. Test duplicate email registration returns 409 error', async () => {
      await expect(
        authService.register({
          name: 'Jane Duplicate',
          email: 'jane@example.com', // Seeded user
          password: 'password123',
          phone: '5551234567',
        })
      ).rejects.toThrow('Email address is already registered.');
    });
  });

  describe('Requirement 4 & 5 & 6: Login Requirements', () => {
    it('4. Test login with valid credentials (jane@example.com)', async () => {
      const result = await authService.login({
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe('jane@example.com');
      expect(result.token).toBeTruthy();
      expect(jwtUtils.isTokenValid(result.token)).toBe(true);
    });

    it('5. Test login with incorrect credentials returns 401 error', async () => {
      await expect(
        authService.login({
          email: 'jane@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Email or password is incorrect.');
    });

    it('6. Test empty form submissions fail validation', () => {
      const loginValidation = validator.validateLoginForm({
        email: '',
        password: '',
      });
      expect(loginValidation.email.isValid).toBe(false);
      expect(loginValidation.email.error).toBe('Email is required.');
      expect(loginValidation.password.isValid).toBe(false);
      expect(loginValidation.password.error).toBe('Password is required.');

      const registerValidation = validator.validateRegistrationForm({
        name: '',
        email: '',
        password: '',
        phone: '',
      });
      expect(registerValidation.name.isValid).toBe(false);
      expect(registerValidation.email.isValid).toBe(false);
      expect(registerValidation.password.isValid).toBe(false);
      expect(registerValidation.phone.isValid).toBe(false);
    });

    it('6b. Test login form validation rejects malformed email strings', () => {
      const loginValidation = validator.validateLoginForm({
        email: 'notanemail',
        password: 'password123',
      });
      expect(loginValidation.email.isValid).toBe(false);
      expect(loginValidation.email.error).toBe('Please enter a valid email address.');
      expect(loginValidation.password.isValid).toBe(true);
    });
  });

  describe('Requirement 7 & 8: Token Persistence & Refresh & Logout', () => {
    it('7. Verify session hydration after simulated refresh', async () => {
      const loginResult = await authService.login({
        email: 'jane@example.com',
        password: 'password123',
      });

      // Save token to localStorage as AuthContext does
      storageUtils.saveToken(loginResult.token);

      // Verify token is in localStorage
      const savedToken = storageUtils.loadToken();
      expect(savedToken).toBe(loginResult.token);
      expect(jwtUtils.isTokenValid(savedToken!)).toBe(true);

      // Verify user session decoded accurately from token
      const decodedUser = jwtUtils.decodeUser(savedToken!);
      expect(decodedUser).toBeDefined();
      expect(decodedUser?.email).toBe('jane@example.com');
      expect(decodedUser?.name).toBe('Jane Doe');
    });

    it('8. Verify logout cleans up stored token safely', () => {
      storageUtils.saveToken('dummy.jwt.token');
      expect(storageUtils.loadToken()).toBe('dummy.jwt.token');

      // Logout action
      storageUtils.clearToken();
      expect(storageUtils.loadToken()).toBeNull();
    });
  });

  describe('Requirement 10: Vercel Serverless Functions Verification', () => {
    it('Vercel login handler returns 200 with JWT for seeded user', () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { email: 'jane@example.com', password: 'password123' },
      });

      loginHandler(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.jsonData.data.user.email).toBe('jane@example.com');
      expect(res.jsonData.data.token).toBeTruthy();
      expect(jwtUtils.isTokenValid(res.jsonData.data.token)).toBe(true);
    });

    it('Vercel login handler returns 401 for bad password', () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: { email: 'jane@example.com', password: 'wrong' },
      });

      loginHandler(req, res);
      expect(res.statusCode).toBe(401);
      expect(res.jsonData.error).toBe('Email or password is incorrect.');
    });

    it('Vercel login handler returns 405 for GET', () => {
      const { req, res } = createMockReqRes({ method: 'GET' });
      loginHandler(req, res);
      expect(res.statusCode).toBe(405);
    });

    it('Vercel register handler creates new user and returns 201 with JWT', () => {
      const serverlessEmail = `serverless_${Date.now()}@test.com`;
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          name: 'Vercel User',
          email: serverlessEmail,
          password: 'password123',
          phone: '9876543210',
        },
      });

      registerHandler(req, res);
      expect(res.statusCode).toBe(201);
      expect(res.jsonData.data.user.email).toBe(serverlessEmail);
      expect(res.jsonData.data.token).toBeTruthy();
      expect(jwtUtils.isTokenValid(res.jsonData.data.token)).toBe(true);
    });

    it('Vercel register handler returns 409 for duplicate email', () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          name: 'Jane Again',
          email: 'jane@example.com',
          password: 'password123',
          phone: '5551234567',
        },
      });

      registerHandler(req, res);
      expect(res.statusCode).toBe(409);
      expect(res.jsonData.error).toBe('Email address is already registered.');
    });

    it('Vercel register handler returns 400 for short password', () => {
      const { req, res } = createMockReqRes({
        method: 'POST',
        body: {
          name: 'Short Pass',
          email: 'short@test.com',
          password: 'short',
          phone: '1234567890',
        },
      });

      registerHandler(req, res);
      expect(res.statusCode).toBe(400);
      expect(res.jsonData.error).toContain('between 8 and 128 characters');
    });
  });
});
