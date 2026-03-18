import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { formatRelativeTime } from '@/lib/time/format-relative';

describe('lib/time/format-relative', () => {
  // Reference time: 2025-03-18 12:00:00 UTC
  const refDate = new Date('2025-03-18T12:00:00Z');
  const refTimestamp = Math.floor(refDate.getTime() / 1000);
  const SECONDS_PER_DAY = 86400;
  const SECONDS_PER_HOUR = 3600;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(refDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    describe('today', () => {
      it('should return "今天" for timestamp from earlier today', () => {
        // 3 hours ago
        const timestamp = refTimestamp - 3 * SECONDS_PER_HOUR;
        expect(formatRelativeTime(timestamp)).toBe('今天');
      });

      it('should return "今天" for timestamp from 1 minute ago', () => {
        // 1 minute ago
        const timestamp = refTimestamp - 60;
        expect(formatRelativeTime(timestamp)).toBe('今天');
      });
    });

    describe('yesterday', () => {
      it('should return "昨天" for timestamp from yesterday', () => {
        // 1 day ago
        const timestamp = refTimestamp - 1 * SECONDS_PER_DAY;
        expect(formatRelativeTime(timestamp)).toBe('昨天');
      });

      it('should return "昨天" for timestamp from 25 hours ago', () => {
        // 25 hours ago (yesterday in day count)
        const timestamp = refTimestamp - 25 * SECONDS_PER_HOUR;
        expect(formatRelativeTime(timestamp)).toBe('昨天');
      });
    });

    describe('days ago', () => {
      it('should return "2 天前" for timestamp from 2 days ago', () => {
        const timestamp = refTimestamp - 2 * SECONDS_PER_DAY;
        expect(formatRelativeTime(timestamp)).toBe('2 天前');
      });

      it('should return "3 天前" for timestamp from 3 days ago', () => {
        const timestamp = refTimestamp - 3 * SECONDS_PER_DAY;
        expect(formatRelativeTime(timestamp)).toBe('3 天前');
      });

      it('should return "6 天前" for timestamp from 6 days ago', () => {
        const timestamp = refTimestamp - 6 * SECONDS_PER_DAY;
        expect(formatRelativeTime(timestamp)).toBe('6 天前');
      });
    });

    describe('week or more ago', () => {
      it('should return locale date string for timestamp from 7 days ago', () => {
        const timestamp = refTimestamp - 7 * SECONDS_PER_DAY;
        const result = formatRelativeTime(timestamp);
        expect(result).toMatch(/2025/);
        expect(result).not.toBe('7 天前');
      });

      it('should return locale date string for timestamp from a month ago', () => {
        const timestamp = refTimestamp - 30 * SECONDS_PER_DAY;
        const result = formatRelativeTime(timestamp);
        expect(result).toMatch(/2025/);
      });
    });

    describe('edge cases', () => {
      it('should return empty string for null', () => {
        expect(formatRelativeTime(null)).toBe('');
      });

      it('should return empty string for undefined', () => {
        expect(formatRelativeTime(undefined)).toBe('');
      });

      it('should handle millisecond timestamps', () => {
        // 3 hours ago in milliseconds
        const msTimestamp = (refTimestamp - 3 * SECONDS_PER_HOUR) * 1000;
        expect(formatRelativeTime(msTimestamp)).toBe('今天');
      });
    });

    describe('locale parameter', () => {
      it('should use custom locale for fallback date', () => {
        const timestamp = refTimestamp - 7 * SECONDS_PER_DAY;
        const result = formatRelativeTime(timestamp, 'en-US');
        expect(result).toMatch(/2025/);
      });
    });
  });
});
