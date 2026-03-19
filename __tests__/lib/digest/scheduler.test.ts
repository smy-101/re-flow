import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import {
  calculateNextSendAt,
  isTimeToSend,
  getFrequencyWindowDays,
} from '@/lib/digest/scheduler';
import type { EmailDigestConfig } from '@/lib/db/schema';

describe('lib/digest/scheduler', () => {
  beforeEach(() => {
    // Mock current time to a fixed point: 2026-03-19 10:00:00 UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-19T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getFrequencyWindowDays', () => {
    it('should return 1 for daily frequency', () => {
      expect(getFrequencyWindowDays('daily', null)).toBe(1);
    });

    it('should return 7 for weekly frequency', () => {
      expect(getFrequencyWindowDays('weekly', null)).toBe(7);
    });

    it('should return custom days for custom frequency', () => {
      expect(getFrequencyWindowDays('custom', 3)).toBe(3);
      expect(getFrequencyWindowDays('custom', 15)).toBe(15);
    });

    it('should return 1 as default for custom frequency without customDays', () => {
      expect(getFrequencyWindowDays('custom', null)).toBe(1);
    });
  });

  describe('calculateNextSendAt', () => {
    // Current time: 2026-03-19 10:00:00 UTC = 1773914400

    it('should calculate next send time for daily frequency', () => {
      // Current time: 2026-03-19 10:00:00 UTC
      // Send time: 08:00, Timezone: UTC
      // Since 10:00 > 08:00, next send should be 2026-03-20 08:00:00 UTC
      const config = {
        frequency: 'daily',
        customDays: null,
        sendTime: '08:00',
        timezone: 'UTC',
      } as Pick<EmailDigestConfig, 'frequency' | 'customDays' | 'sendTime' | 'timezone'>;

      const nextSendAt = calculateNextSendAt(config);
      // 2026-03-20 08:00:00 UTC = 1773993600
      expect(nextSendAt).toBe(1773993600);
    });

    it('should calculate next send time for weekly frequency', () => {
      // Current time: 2026-03-19 10:00:00 UTC
      // Send time: 08:00, Timezone: UTC
      // Next send should be 2026-03-26 08:00:00 UTC (7 days later)
      const config = {
        frequency: 'weekly',
        customDays: null,
        sendTime: '08:00',
        timezone: 'UTC',
      } as Pick<EmailDigestConfig, 'frequency' | 'customDays' | 'sendTime' | 'timezone'>;

      const nextSendAt = calculateNextSendAt(config);
      // 2026-03-26 08:00:00 UTC = 1774512000
      expect(nextSendAt).toBe(1774512000);
    });

    it('should calculate next send time for custom frequency (3 days)', () => {
      // Current time: 2026-03-19 10:00:00 UTC
      // Send time: 08:00, Timezone: UTC
      // Next send should be 2026-03-22 08:00:00 UTC (3 days later)
      const config = {
        frequency: 'custom',
        customDays: 3,
        sendTime: '08:00',
        timezone: 'UTC',
      } as Pick<EmailDigestConfig, 'frequency' | 'customDays' | 'sendTime' | 'timezone'>;

      const nextSendAt = calculateNextSendAt(config);
      // 2026-03-22 08:00:00 UTC = 1774166400
      expect(nextSendAt).toBe(1774166400);
    });

    it('should handle timezone conversion (Asia/Shanghai UTC+8)', () => {
      // Current time: 2026-03-19 10:00:00 UTC = 2026-03-19 18:00:00 Asia/Shanghai
      // Send time: 08:00, Timezone: Asia/Shanghai
      // Since 18:00 > 08:00, next send should be 2026-03-20 08:00:00 Asia/Shanghai = 2026-03-20 00:00:00 UTC
      const config = {
        frequency: 'daily',
        customDays: null,
        sendTime: '08:00',
        timezone: 'Asia/Shanghai',
      } as Pick<EmailDigestConfig, 'frequency' | 'customDays' | 'sendTime' | 'timezone'>;

      const nextSendAt = calculateNextSendAt(config);
      // 2026-03-20 00:00:00 UTC = 1773964800
      expect(nextSendAt).toBe(1773964800);
    });

    it('should handle timezone conversion (America/New_York UTC-4/5)', () => {
      // Current time: 2026-03-19 10:00:00 UTC = 2026-03-19 06:00:00 America/New_York (EDT, UTC-4)
      // Note: March 19, 2026 is after DST starts (March 8, 2026), so it's EDT (UTC-4)
      // Send time: 08:00, Timezone: America/New_York
      // Since 06:00 < 08:00, next send should be same day 2026-03-19 08:00:00 EDT = 2026-03-19 12:00:00 UTC
      const config = {
        frequency: 'daily',
        customDays: null,
        sendTime: '08:00',
        timezone: 'America/New_York',
      } as Pick<EmailDigestConfig, 'frequency' | 'customDays' | 'sendTime' | 'timezone'>;

      const nextSendAt = calculateNextSendAt(config);
      // 2026-03-19 12:00:00 UTC = 1773921600
      expect(nextSendAt).toBe(1773921600);
    });

    it('should schedule for same day if send time has not passed yet', () => {
      // Current time: 2026-03-19 10:00:00 UTC
      // Send time: 14:00, Timezone: UTC
      // Next send should be 2026-03-19 14:00:00 UTC (same day, 4 hours from now)
      const config = {
        frequency: 'daily',
        customDays: null,
        sendTime: '14:00',
        timezone: 'UTC',
      } as Pick<EmailDigestConfig, 'frequency' | 'customDays' | 'sendTime' | 'timezone'>;

      const nextSendAt = calculateNextSendAt(config);
      // 2026-03-19 14:00:00 UTC = 1773928800
      expect(nextSendAt).toBe(1773928800);
    });
  });

  describe('isTimeToSend', () => {
    // Current time: 2026-03-19 10:00:00 UTC = 1773914400

    it('should return true when nextSendAt is in the past', () => {
      // nextSendAt: 2026-03-19 08:00:00 UTC = 1773907200
      expect(isTimeToSend(1773907200)).toBe(true);
    });

    it('should return true when nextSendAt is exactly now', () => {
      // Current time: 2026-03-19 10:00:00 UTC = 1773914400
      expect(isTimeToSend(1773914400)).toBe(true);
    });

    it('should return false when nextSendAt is in the future', () => {
      // nextSendAt: 2026-03-19 14:00:00 UTC = 1773928800
      expect(isTimeToSend(1773928800)).toBe(false);
    });

    it('should return false when nextSendAt is null', () => {
      expect(isTimeToSend(null)).toBe(false);
    });
  });
});
