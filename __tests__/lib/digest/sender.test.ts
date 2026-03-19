import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import {
  sendDigestEmail,
  updateConfigAfterSend,
  shouldPauseDueToFailures,
  type SendDigestInput,
} from '@/lib/digest/sender';

// Mock the email module
vi.mock('@/lib/auth/email', () => ({
  sendEmail: vi.fn(),
}));

describe('lib/digest/sender', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { sendEmail: mockSendEmail } = await import('@/lib/auth/email');
    vi.mocked(mockSendEmail).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendDigestEmail', () => {
    it('should send email and return success', async () => {
      const { sendEmail: mockSendEmail } = await import('@/lib/auth/email');
      vi.mocked(mockSendEmail).mockResolvedValueOnce({ success: true, messageId: 'test-id' });

      const input: SendDigestInput = {
        to: 'user@example.com',
        subject: 'Test Digest',
        htmlContent: '<html>Test</html>',
        userId: 1,
        configId: 1,
        itemCount: 5,
      };

      const result = await sendDigestEmail(input);

      expect(result.success).toBe(true);
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'user@example.com',
        subject: 'Test Digest',
        html: '<html>Test</html>',
      });
    });

    it('should return failure when email sending fails', async () => {
      const { sendEmail: mockSendEmail } = await import('@/lib/auth/email');
      vi.mocked(mockSendEmail).mockRejectedValueOnce(new Error('SMTP error'));

      const input: SendDigestInput = {
        to: 'user@example.com',
        subject: 'Test Digest',
        htmlContent: '<html>Test</html>',
        userId: 1,
        configId: 1,
        itemCount: 5,
      };

      const result = await sendDigestEmail(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP error');
    });

    it('should handle empty recipient', async () => {
      const input: SendDigestInput = {
        to: '',
        subject: 'Test Digest',
        htmlContent: '<html>Test</html>',
        userId: 1,
        configId: 1,
        itemCount: 5,
      };

      const result = await sendDigestEmail(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('recipient');
    });
  });

  describe('shouldPauseDueToFailures', () => {
    it('should return false when consecutive failures < 3', () => {
      expect(shouldPauseDueToFailures(0)).toBe(false);
      expect(shouldPauseDueToFailures(1)).toBe(false);
      expect(shouldPauseDueToFailures(2)).toBe(false);
    });

    it('should return true when consecutive failures >= 3', () => {
      expect(shouldPauseDueToFailures(3)).toBe(true);
      expect(shouldPauseDueToFailures(4)).toBe(true);
      expect(shouldPauseDueToFailures(10)).toBe(true);
    });
  });

  describe('updateConfigAfterSend', () => {
    it('should reset consecutive failures on success', () => {
      const result = updateConfigAfterSend({
        success: true,
        configId: 1,
        itemCount: 5,
      });

      expect(result.consecutiveFailures).toBe(0);
      expect(result.pausedDueToFailures).toBe(false);
      expect(result.lastSentAt).toBeDefined();
    });

    it('should increment consecutive failures on failure', () => {
      const result = updateConfigAfterSend({
        success: false,
        configId: 1,
        currentFailureCount: 1,
        error: 'SMTP error',
      });

      expect(result.consecutiveFailures).toBe(2);
    });

    it('should set pausedDueToFailures when threshold reached', () => {
      const result = updateConfigAfterSend({
        success: false,
        configId: 1,
        currentFailureCount: 2,
        error: 'SMTP error',
      });

      expect(result.consecutiveFailures).toBe(3);
      expect(result.pausedDueToFailures).toBe(true);
    });
  });
});
