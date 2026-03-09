import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  formatTimestamp,
  getCurrentUnixTimestamp,
  normalizeTimestampToSeconds,
} from '@/lib/time/timestamp';

describe('lib/time/timestamp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentUnixTimestamp', () => {
    it('should return current time in Unix seconds', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1773017838344);

      expect(getCurrentUnixTimestamp()).toBe(1773017838);
    });
  });

  describe('normalizeTimestampToSeconds', () => {
    it('should keep second timestamps unchanged', () => {
      expect(normalizeTimestampToSeconds(1773017838)).toBe(1773017838);
    });

    it('should convert millisecond timestamps to seconds', () => {
      expect(normalizeTimestampToSeconds(1773017838344)).toBe(1773017838);
    });

    it('should preserve nullish values', () => {
      expect(normalizeTimestampToSeconds(null)).toBeNull();
      expect(normalizeTimestampToSeconds(undefined)).toBeUndefined();
    });
  });

  describe('formatTimestamp', () => {
    it('should format second timestamps as local time', () => {
      expect(
        formatTimestamp(1773017838, 'zh-CN', {
          hour12: false,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      ).toBe('2026/3/9 08:57');
    });

    it('should tolerate millisecond timestamps and render the same real date', () => {
      expect(
        formatTimestamp(1773017838344, 'zh-CN', {
          hour12: false,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      ).toBe('2026/3/9 08:57');
    });
  });
});
