import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '@/lib/auth/encryption';

describe('Encryption Module', () => {
  describe('encrypt', () => {
    it('should encrypt plaintext', () => {
      const plaintext = 'test-api-key-123';
      const result = encrypt(plaintext);

      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.tag).toBeDefined();
      expect(result.encrypted).not.toBe(plaintext);
      expect(result.iv.length).toBe(32); // 16 bytes = 32 hex chars
      expect(result.tag.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should produce different outputs for same plaintext (random IV)', () => {
      const plaintext = 'test-api-key-123';
      const result1 = encrypt(plaintext);
      const result2 = encrypt(plaintext);

      // IV should be different
      expect(result1.iv).not.toBe(result2.iv);
      // Encrypted text should be different due to different IV
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const result = encrypt(plaintext);

      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.tag).toBeDefined();
    });

    it('should handle special characters', () => {
      const plaintext = 'api-key-with-特殊字符-!@#$%^&*()';
      const result = encrypt(plaintext);

      expect(result.encrypted).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.tag).toBeDefined();
    });
  });

  describe('decrypt', () => {
    it('should decrypt correctly encrypted text', () => {
      const plaintext = 'test-api-key-123';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt multiple different values correctly', () => {
      const values = [
        'api-key-1',
        'sk-abcdefghijklmnopqrstuvwxyz',
        'api-key-with-特殊字符-123',
        'a'.repeat(100),
      ];

      values.forEach((plaintext) => {
        const encrypted = encrypt(plaintext);
        const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);
        expect(decrypted).toBe(plaintext);
      });
    });

    it('should decrypt empty string', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid IV', () => {
      const plaintext = 'test-api-key-123';
      const encrypted = encrypt(plaintext);

      expect(() => {
        decrypt(encrypted.encrypted, 'invalid-iv', encrypted.tag);
      }).toThrow();
    });

    it('should throw error for invalid tag', () => {
      const plaintext = 'test-api-key-123';
      const encrypted = encrypt(plaintext);

      expect(() => {
        decrypt(encrypted.encrypted, encrypted.iv, 'invalid-tag');
      }).toThrow();
    });

    it('should throw error for invalid encrypted text', () => {
      const plaintext = 'test-api-key-123';
      const encrypted = encrypt(plaintext);

      expect(() => {
        decrypt('invalid-encrypted', encrypted.iv, encrypted.tag);
      }).toThrow();
    });
  });

  describe('round-trip encryption/decryption', () => {
    it('should handle API keys correctly', () => {
      const apiKeys = [
        'sk-abcdefghijklmnopqrstuvwxyz123456',
        'sk-proj-abcdefghijklmnopqrstuvwxyz1234567890',
        'sk-ant-abcdefghijklmnopqrstuvwxyz123456',
        'xai-abcdefghijklmnopqrstuvwxyz1234567890',
      ];

      apiKeys.forEach((apiKey) => {
        const encrypted = encrypt(apiKey);
        const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);
        expect(decrypted).toBe(apiKey);
      });
    });

    it('should preserve data integrity across multiple operations', () => {
      const original = 'original-api-key-123456';
      const encrypted1 = encrypt(original);
      const decrypted1 = decrypt(encrypted1.encrypted, encrypted1.iv, encrypted1.tag);
      const encrypted2 = encrypt(decrypted1);
      const decrypted2 = decrypt(encrypted2.encrypted, encrypted2.iv, encrypted2.tag);

      expect(decrypted1).toBe(original);
      expect(decrypted2).toBe(original);
    });
  });
});
