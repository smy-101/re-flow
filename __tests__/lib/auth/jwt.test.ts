import { describe, it, expect, beforeAll, vi } from 'vitest';
import { signToken, verifyToken, getUserIdFromToken } from '@/lib/auth/jwt';

// Mock jose module to avoid crypto API issues in test environment
vi.mock('jose', async () => {
  const actual = await vi.importActual('jose');

  // Simple JWT implementation for testing
  const createMockJWT = async (payload: any, secret: string) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadEncoded = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }));
    const signature = 'mock-signature';
    return `${header}.${payloadEncoded}.${signature}`;
  };

  const verifyMockJWT = async (token: string, secret: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');

      // Check for tampered signature
      if (parts[2] !== 'mock-signature') {
        throw new Error('Invalid signature');
      }

      const payload = JSON.parse(atob(parts[1]));

      // Check for missing required fields
      if (!payload.sub || !payload.exp || !payload.iat) {
        return null;
      }

      // Check for expired token
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      return { payload };
    } catch {
      throw new Error('Invalid token');
    }
  };

  return {
    ...actual,
    SignJWT: class {
      constructor(private payload: any) {}
      setProtectedHeader(params: any) { return this; }
      setIssuedAt() { return this; }
      setExpirationTime(time: string) { return this; }
      async sign(secret: string) {
        return createMockJWT(this.payload, secret);
      }
    },
    jwtVerify: async (token: string, secret: string) => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token');

        // Check for tampered signature
        if (parts[2] !== 'mock-signature') {
          throw new Error('Invalid signature');
        }

        const payload = JSON.parse(atob(parts[1]));

        // Check for missing required fields
        if (!payload.sub || !payload.exp || !payload.iat) {
          throw new Error('Invalid token');
        }

        // Check for expired token
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          throw new Error('Token expired');
        }

        return { payload };
      } catch {
        throw new Error('Invalid token');
      }
    },
  };
});

describe('JWT Utilities', () => {
  beforeAll(() => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
  });

  describe('signToken', () => {
    it('should sign a token with user ID', async () => {
      const userId = 123;
      const token = await signToken(userId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should throw error if JWT_SECRET is not set', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      await expect(signToken(123)).rejects.toThrow(
        'JWT_SECRET environment variable is not set'
      );

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const userId = 123;
      const token = await signToken(userId);
      const payload = await verifyToken(token);

      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(String(userId));
      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
    });

    it('should return null for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const payload = await verifyToken(invalidToken);

      expect(payload).toBeNull();
    });

    it('should return null for malformed token', async () => {
      const malformedToken = 'not-a-jwt';
      const payload = await verifyToken(malformedToken);

      expect(payload).toBeNull();
    });
  });

  describe('getUserIdFromToken', () => {
    it('should extract user ID from valid token', async () => {
      const userId = 456;
      const token = await signToken(userId);
      const extractedUserId = await getUserIdFromToken(token);

      expect(extractedUserId).toBe(userId);
    });

    it('should return null for invalid token', async () => {
      const invalidToken = 'invalid.token.here';
      const extractedUserId = await getUserIdFromToken(invalidToken);

      expect(extractedUserId).toBeNull();
    });

    it('should handle numeric user IDs correctly', async () => {
      const userId = 789;
      const token = await signToken(userId);
      const extractedUserId = await getUserIdFromToken(token);

      expect(typeof extractedUserId).toBe('number');
      expect(extractedUserId).toBe(userId);
    });

    it('should return null for expired token', async () => {
      // Create an expired token manually
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: '123',
        iat: Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60, // 8 days ago
        exp: Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60, // 1 day ago
      }));
      const signature = 'mock-signature';
      const expiredToken = `${header}.${payload}.${signature}`;

      const extractedUserId = await getUserIdFromToken(expiredToken);
      expect(extractedUserId).toBeNull();
    });

    it('should return null for token with invalid signature', async () => {
      const token = await signToken(123);
      // Tamper with the signature
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.invalid-signature`;

      const extractedUserId = await getUserIdFromToken(tamperedToken);
      expect(extractedUserId).toBeNull();
    });

    it('should return null for empty string token', async () => {
      const extractedUserId = await getUserIdFromToken('');
      expect(extractedUserId).toBeNull();
    });

    it('should return null for whitespace-only token', async () => {
      const extractedUserId = await getUserIdFromToken('   ');
      expect(extractedUserId).toBeNull();
    });

    it('should return null for token with invalid base64', async () => {
      const invalidBase64Token = 'invalid-base64!.payload.signature';
      const extractedUserId = await getUserIdFromToken(invalidBase64Token);
      expect(extractedUserId).toBeNull();
    });

    it('should return null for token with missing sub field', async () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      }));
      const signature = 'mock-signature';
      const tokenWithoutSub = `${header}.${payload}.${signature}`;

      const extractedUserId = await getUserIdFromToken(tokenWithoutSub);
      expect(extractedUserId).toBeNull();
    });

    it('should return null for token with missing exp field', async () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: '123',
        iat: Math.floor(Date.now() / 1000),
      }));
      const signature = 'mock-signature';
      const tokenWithoutExp = `${header}.${payload}.${signature}`;

      const extractedUserId = await getUserIdFromToken(tokenWithoutExp);
      expect(extractedUserId).toBeNull();
    });

    it('should return null for token with missing iat field', async () => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: '123',
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      }));
      const signature = 'mock-signature';
      const tokenWithoutIat = `${header}.${payload}.${signature}`;

      const extractedUserId = await getUserIdFromToken(tokenWithoutIat);
      expect(extractedUserId).toBeNull();
    });

    it('should handle userId of 0', async () => {
      const userId = 0;
      const token = await signToken(userId);
      const extractedUserId = await getUserIdFromToken(token);

      expect(extractedUserId).toBe(0);
    });

    it('should handle negative userId', async () => {
      const userId = -1;
      const token = await signToken(userId);
      const extractedUserId = await getUserIdFromToken(token);

      expect(extractedUserId).toBe(-1);
    });

    it('should handle large userId (MAX_SAFE_INTEGER)', async () => {
      const userId = Number.MAX_SAFE_INTEGER;
      const token = await signToken(userId);
      const extractedUserId = await getUserIdFromToken(token);

      expect(extractedUserId).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should throw error when JWT_SECRET is not set', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      await expect(signToken(123)).rejects.toThrow(
        'JWT_SECRET environment variable is not set'
      );

      process.env.JWT_SECRET = originalSecret;
    });

    it('should throw error when JWT_SECRET is empty string', async () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = '';

      await expect(signToken(123)).rejects.toThrow(
        'JWT_SECRET environment variable is not set'
      );

      process.env.JWT_SECRET = originalSecret;
    });
  });
});
