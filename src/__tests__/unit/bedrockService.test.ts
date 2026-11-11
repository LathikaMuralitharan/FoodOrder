import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  handleChat,
  generateMockResponse,
  checkRateLimit,
  buildMenuKnowledge,
  SYSTEM_PROMPT,
} from '../../../server/bedrockService';

describe('Amazon Bedrock AI Food Assistant Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('rejects empty string message', async () => {
      const result = await handleChat({ message: '' });
      expect(result.status).toBe(400);
      expect('error' in result.data).toBe(true);
      if ('error' in result.data) {
        // Empty string hits the !message || typeof check first
        expect(result.data.error).toMatch(/message is required|cannot be empty/i);
      }
    });

    it('rejects whitespace-only message', async () => {
      const result = await handleChat({ message: '     ' });
      expect(result.status).toBe(400);
      expect('error' in result.data).toBe(true);
      if ('error' in result.data) {
        expect(result.data.error).toMatch(/cannot be empty/i);
      }
    });

    it('rejects message exceeding 500 characters', async () => {
      const longMessage = 'a'.repeat(501);
      const result = await handleChat({ message: longMessage });
      expect(result.status).toBe(400);
      expect('error' in result.data).toBe(true);
      if ('error' in result.data) {
        expect(result.data.error).toMatch(/exceeds maximum length/i);
      }
    });

    it('rejects non-string message', async () => {
      // @ts-expect-error testing invalid runtime input
      const result = await handleChat({ message: null });
      expect(result.status).toBe(400);
      expect('error' in result.data).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('allows requests within rate limit and tracks remaining quota', () => {
      const testIp = `192.168.1.${Date.now() % 250}`;
      const first = checkRateLimit(testIp);
      expect(first.allowed).toBe(true);
      expect(first.remaining).toBeGreaterThanOrEqual(0);
    });

    it('blocks requests when rate limit is exceeded', () => {
      const testIp = `10.0.0.${Date.now() % 250}`;
      // Consume all allowed requests
      for (let i = 0; i < 20; i++) {
        checkRateLimit(testIp);
      }
      const blocked = checkRateLimit(testIp);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetInSeconds).toBeGreaterThan(0);
    });
  });

  describe('Grounding & Catalog Knowledge', () => {
    it('knowledge base contains all open and closed restaurants', () => {
      const knowledge = buildMenuKnowledge();
      expect(knowledge).toContain('Pizza Palace');
      expect(knowledge).toContain('Dragon Wok');
      expect(knowledge).toContain('Taco Fiesta');
      expect(knowledge).toContain('Curry House');
      expect(knowledge).toContain('Burger Joint');
      expect(knowledge).toContain('Thai Garden');
      expect(knowledge).toContain('CLOSED');
      expect(knowledge).toContain('OPEN for self-pickup');
    });

    it('system prompt enforces strict grounding and zero hallucination', () => {
      expect(SYSTEM_PROMPT).toContain('STRICT GROUNDING RULES');
      expect(SYSTEM_PROMPT).toContain('ONLY recommend dishes that are currently available');
      expect(SYSTEM_PROMPT).toContain('NEVER invent dishes, prices, or ingredients');
      expect(SYSTEM_PROMPT).toContain('self-pickup');
    });
  });

  describe('Mock / Demo Safe Fallback', () => {
    it('returns grounded response for gluten-free query', () => {
      const response = generateMockResponse('gluten-free');
      expect(response).toContain('Caesar Salad');
      expect(response).toContain('Guacamole');
      expect(response).toContain('Lamb Biryani');
      expect(response).toContain('$8.99');
    });

    it('returns grounded response for pizza query and notes sold-out Truffle Pizza', () => {
      const response = generateMockResponse('what pizza is available?');
      expect(response).toContain('Margherita Pizza');
      expect(response).toContain('Pepperoni Pizza');
      expect(response).toContain('Pizza Palace');
      expect(response).toContain('sold out');
    });

    it('returns fastest restaurants for quick prep query', () => {
      const response = generateMockResponse('which is the fastest?');
      expect(response).toContain('Burger Joint');
      expect(response).toContain('10 mins');
      expect(response).toContain('Taco Fiesta');
    });

    it('handleChat returns isMock=true when AWS credentials are absent', async () => {
      // Ensure no live AWS keys in test environment
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;

      const result = await handleChat({ message: 'Recommend some food' });
      expect(result.status).toBe(200);
      if ('reply' in result.data) {
        expect(result.data.isMock).toBe(true);
        expect(result.data.provider).toMatch(/Mock \/ Demo/i);
        expect(result.data.reply).toBeTruthy();
      }
    });
  });
});
