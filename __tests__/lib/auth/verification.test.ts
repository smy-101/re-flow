import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateVerificationCode,
  storeVerificationCode,
  verifyCode,
  cleanupCodes,
  canSendCode,
} from '@/lib/auth/verification';

// Mock the database module
vi.mock('@/lib/db', () => {
  const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
  };

  // Create chainable mock
  const createChainable = (returnValue?: unknown) => {
    const chainable = {
      values: vi.fn(() => chainable),
      returning: vi.fn(() => chainable),
      from: vi.fn(() => chainable),
      where: vi.fn(() => chainable),
      orderBy: vi.fn(() => chainable),
      limit: vi.fn(() => chainable),
      execute: vi.fn(() => returnValue),
    };
    return chainable;
  };

  mockDb.insert.mockImplementation(() => createChainable([{ id: 1 }]));
  mockDb.select.mockImplementation(() => createChainable([]));
  mockDb.delete.mockImplementation(() => createChainable(undefined));

  return {
    db: mockDb,
  };
});

describe('Verification Code Utilities', () => {
  beforeEach(async () => {
    const { db } = await import('@/lib/db');
    vi.clearAllMocks();
    // Reset mock implementations
    const createChainable = (returnValue?: unknown) => {
      const chainable = {
        values: vi.fn(() => chainable),
        returning: vi.fn(() => chainable),
        from: vi.fn(() => chainable),
        where: vi.fn(() => chainable),
        orderBy: vi.fn(() => chainable),
        limit: vi.fn(() => chainable),
        execute: vi.fn(() => returnValue),
      };
      return chainable;
    };
    (db.insert as ReturnType<typeof vi.fn>).mockImplementation(() => createChainable([{ id: 1 }]));
    (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => createChainable([]));
    (db.delete as ReturnType<typeof vi.fn>).mockImplementation(() => createChainable(undefined));
  });
  describe('generateVerificationCode', () => {
    it('should generate a 6-digit string', () => {
      const code = generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate different codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateVerificationCode());
      }
      // With 100 codes, we should have more than 1 unique code
      expect(codes.size).toBeGreaterThan(1);
    });

    it('should generate codes between 000000 and 999999', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateVerificationCode();
        const num = parseInt(code, 10);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe('storeVerificationCode', () => {
    it('should store verification code with 10 minute expiry', async () => {
      const { db } = await import('@/lib/db');
      const email = 'test@example.com';
      const code = '123456';
      const type = 'register';

      await storeVerificationCode(email, code, type);

      expect(db.insert).toHaveBeenCalled();
    });

    it('should accept different verification types', async () => {
      const { db } = await import('@/lib/db');
      const email = 'test@example.com';
      const code = '123456';

      await storeVerificationCode(email, code, 'register');
      await storeVerificationCode(email, code, 'reset_password');

      expect(db.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyCode', () => {
    it('should return valid for correct code', async () => {
      const { db } = await import('@/lib/db');
      const now = Math.floor(Date.now() / 1000);
      const futureExpiry = now + 600; // 10 minutes from now

      // Mock finding a valid code
      const chainable = {
        from: vi.fn(() => chainable),
        where: vi.fn(() => chainable),
        execute: vi.fn(() => [
          { id: 1, email: 'test@example.com', code: '123456', type: 'register', expiresAt: futureExpiry },
        ]),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(chainable);

      const result = await verifyCode('test@example.com', '123456', 'register');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for wrong code', async () => {
      const { db } = await import('@/lib/db');

      // Mock finding no matching code
      const chainable = {
        from: vi.fn(() => chainable),
        where: vi.fn(() => chainable),
        execute: vi.fn(() => []),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(chainable);

      const result = await verifyCode('test@example.com', 'wrong', 'register');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('验证码错误');
    });

    it('should return invalid for expired code', async () => {
      const { db } = await import('@/lib/db');
      const pastExpiry = Math.floor(Date.now() / 1000) - 1; // Already expired

      // Mock finding an expired code
      const chainable = {
        from: vi.fn(() => chainable),
        where: vi.fn(() => chainable),
        execute: vi.fn(() => [
          { id: 1, email: 'test@example.com', code: '123456', type: 'register', expiresAt: pastExpiry },
        ]),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(chainable);

      const result = await verifyCode('test@example.com', '123456', 'register');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('验证码已过期，请重新获取');
    });
  });

  describe('cleanupCodes', () => {
    it('should delete all codes for email and type', async () => {
      const { db } = await import('@/lib/db');

      await cleanupCodes('test@example.com', 'register');

      expect(db.delete).toHaveBeenCalled();
    });
  });

  describe('canSendCode', () => {
    it('should return true when no recent code exists', async () => {
      const { db } = await import('@/lib/db');

      // Mock no recent code found
      const chainable = {
        from: vi.fn(() => chainable),
        where: vi.fn(() => chainable),
        orderBy: vi.fn(() => chainable),
        limit: vi.fn(() => chainable),
        execute: vi.fn(() => []),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(chainable);

      const result = await canSendCode('test@example.com', 'register');
      expect(result.canSend).toBe(true);
    });

    it('should return false when code was sent within 60 seconds', async () => {
      const { db } = await import('@/lib/db');
      const recentTime = Math.floor(Date.now() / 1000) - 30; // 30 seconds ago

      // Mock recent code found
      const chainable = {
        from: vi.fn(() => chainable),
        where: vi.fn(() => chainable),
        orderBy: vi.fn(() => chainable),
        limit: vi.fn(() => chainable),
        execute: vi.fn(() => [
          { id: 1, email: 'test@example.com', code: '123456', type: 'register', createdAt: recentTime },
        ]),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(chainable);

      const result = await canSendCode('test@example.com', 'register');
      expect(result.canSend).toBe(false);
      expect(result.waitSeconds).toBeGreaterThan(0);
    });

    it('should return true when code was sent more than 60 seconds ago', async () => {
      const { db } = await import('@/lib/db');
      const oldTime = Math.floor(Date.now() / 1000) - 61; // 61 seconds ago

      // Mock old code found
      const chainable = {
        from: vi.fn(() => chainable),
        where: vi.fn(() => chainable),
        orderBy: vi.fn(() => chainable),
        limit: vi.fn(() => chainable),
        execute: vi.fn(() => [
          { id: 1, email: 'test@example.com', code: '123456', type: 'register', createdAt: oldTime },
        ]),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(chainable);

      const result = await canSendCode('test@example.com', 'register');
      expect(result.canSend).toBe(true);
    });
  });
});
