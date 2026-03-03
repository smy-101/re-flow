import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate hashes starting with $2b$', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$2b\$/);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const password = 'testPassword123';
      const isValid = await verifyPassword(password, '');

      expect(isValid).toBe(false);
    });

    it('should throw error for undefined password in verification', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      await expect(verifyPassword(undefined as any, hash)).rejects.toThrow('data and hash arguments required');
    });

    it('should throw error for undefined hash', async () => {
      const password = 'testPassword123';

      await expect(verifyPassword(password, undefined as any)).rejects.toThrow('data and hash arguments required');
    });

    it('should hash 1KB password', async () => {
      const password = 'a'.repeat(1024); // 1KB
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2b\$/);
    });

    it('should hash 10KB password', async () => {
      const password = 'a'.repeat(10240); // 10KB
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^\$2b\$/);
    });

    it('should verify 1KB password', async () => {
      const password = 'a'.repeat(1024); // 1KB
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should hash Unicode password', async () => {
      const password = '密码123パスワード пароль';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('should verify Unicode password', async () => {
      const password = '密码123パスワード пароль';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should hash Emoji password', async () => {
      const password = '🔐😀🎉🚀';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('should verify Emoji password', async () => {
      const password = '🔐😀🎉🚀';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should hash password with null bytes', async () => {
      const password = 'test\x00password';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('should verify password with null bytes', async () => {
      const password = 'test\x00password';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject non-bcrypt hash', async () => {
      const password = 'testPassword123';
      const fakeHash = 'not-a-bcrypt-hash';
      const isValid = await verifyPassword(password, fakeHash);

      expect(isValid).toBe(false);
    });

    it('should reject truncated hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const truncatedHash = hash.slice(0, 20); // Too short for bcrypt
      const isValid = await verifyPassword(password, truncatedHash);

      expect(isValid).toBe(false);
    });

    it('should reject hash with invalid format', async () => {
      const password = 'testPassword123';
      const invalidHash = '$2y$12$invalidhashformat';
      const isValid = await verifyPassword(password, invalidHash);

      expect(isValid).toBe(false);
    });
  });
});
