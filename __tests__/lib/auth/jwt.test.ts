import { describe, it, expect, beforeAll } from 'vitest';
import { signToken, verifyToken, getUserIdFromToken } from '@/lib/auth/jwt';

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
  });
});
