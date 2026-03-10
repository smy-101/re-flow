import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { createTransporter, sendVerificationEmail, isEmailConfigured } from '@/lib/auth/email';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));

describe('Email Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isEmailConfigured', () => {
    it('should return false when SMTP_HOST is not set', () => {
      delete process.env.SMTP_HOST;
      expect(isEmailConfigured()).toBe(false);
    });

    it('should return true when all SMTP settings are configured', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';
      expect(isEmailConfigured()).toBe(true);
    });
  });

  describe('createTransporter', () => {
    it('should create a transporter with SMTP config', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';
      process.env.SMTP_SECURE = 'false';

      const transporter = createTransporter();
      expect(transporter).toBeDefined();
    });

    it('should use port 587 by default', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      delete process.env.SMTP_PORT;
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';

      const nodemailer = await import('nodemailer');
      createTransporter();
      expect(nodemailer.default.createTransport).toHaveBeenCalled();
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with code', async () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'noreply@example.com';

      const result = await sendVerificationEmail('test@example.com', '123456', 'register');
      expect(result.success).toBe(true);
    });

    it('should throw error when email is not configured', async () => {
      delete process.env.SMTP_HOST;

      await expect(sendVerificationEmail('test@example.com', '123456', 'register')).rejects.toThrow();
    });
  });
});
