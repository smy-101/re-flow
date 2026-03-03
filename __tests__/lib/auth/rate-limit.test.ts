import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

describe('Rate Limiter', () => {
  const testIdentifier = 'test-ip-address';

  beforeEach(() => {
    // Clear the rate limit map before each test
    resetRateLimit(testIdentifier);
  });

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', () => {
      const result = checkRateLimit(testIdentifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 5 - 1 = 4
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should decrement remaining requests', () => {
      const result1 = checkRateLimit(testIdentifier);
      const result2 = checkRateLimit(testIdentifier);

      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding the limit', () => {
      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier);
      }

      // 6th request should be blocked
      const result = checkRateLimit(testIdentifier);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      // Mock Date.now to control time
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier);
      }

      // Should be blocked
      let result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(false);

      // Advance time past the window (60 seconds + 1ms)
      vi.spyOn(Date, 'now').mockReturnValue(now + 60 * 1000 + 1);

      // Should be allowed again
      result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);

      vi.restoreAllMocks();
    });

    it('should handle different identifiers independently', () => {
      const id1 = 'identifier-1';
      const id2 = 'identifier-2';

      // Exhaust limit for id1
      for (let i = 0; i < 5; i++) {
        checkRateLimit(id1);
      }

      // id1 should be blocked
      const result1 = checkRateLimit(id1);
      expect(result1.allowed).toBe(false);

      // id2 should still be allowed
      const result2 = checkRateLimit(id2);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for identifier', () => {
      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(testIdentifier);
      }

      // Should be blocked
      let result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(false);

      // Reset
      resetRateLimit(testIdentifier);

      // Should be allowed again
      result = checkRateLimit(testIdentifier);
      expect(result.allowed).toBe(true);
    });

    it('should handle non-existent identifiers gracefully', () => {
      expect(() => {
        resetRateLimit('non-existent-identifier');
      }).not.toThrow();
    });

    it('should handle empty string identifier', () => {
      const result = checkRateLimit('');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should handle 1KB identifier without issues', () => {
      const longIdentifier = 'a'.repeat(1024);
      const result = checkRateLimit(longIdentifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should handle 10KB identifier without issues', () => {
      const longIdentifier = 'a'.repeat(10240);
      const result = checkRateLimit(longIdentifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should accurately count concurrent requests', async () => {
      const results = [];

      // Simulate concurrent requests
      for (let i = 0; i < 7; i++) {
        results.push(checkRateLimit('concurrent-test-id'));
      }

      // First 5 should be allowed
      for (let i = 0; i < 5; i++) {
        expect(results[i].allowed).toBe(true);
      }

      // Last 2 should be blocked
      for (let i = 5; i < 7; i++) {
        expect(results[i].allowed).toBe(false);
      }
    });

    it('should handle system time rollback', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Make some requests
      const result1 = checkRateLimit('time-rollback-test');
      expect(result1.allowed).toBe(true);

      // Simulate time rollback (move time backwards)
      vi.spyOn(Date, 'now').mockReturnValue(now - 10000);

      // Should still allow request (time-based reset shouldn't cause issues)
      const result2 = checkRateLimit('time-rollback-test');
      expect(result2.allowed).toBe(true);

      vi.restoreAllMocks();
    });
  });
});
