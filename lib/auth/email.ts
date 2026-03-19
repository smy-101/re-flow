import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { VerificationCodeType } from '@/lib/db/schema';
import { getVerificationEmailHtml } from '@/lib/email-templates/verification-code';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.EMAIL_FROM || `"Re:Flow" <${user}>`;

  if (!host) {
    return null;
  }

  return { host, port, secure, user, pass, from };
}

export function isEmailConfigured(): boolean {
  return !!process.env.SMTP_HOST;
}

export function createTransporter() {
  const config = getEmailConfig();
  if (!config) {
    throw new Error('SMTP configuration is missing');
  }

  const transportOptions = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.pass ? {
      user: config.user,
      pass: config.pass,
    } : undefined,
  } as SMTPTransport.Options;

  return nodemailer.createTransport(transportOptions);
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  type: VerificationCodeType,
): Promise<{ success: boolean; messageId?: string }> {
  if (!isEmailConfigured()) {
    throw new Error('Email service is not configured');
  }

  const config = getEmailConfig();
  if (!config) {
    throw new Error('SMTP configuration is missing');
  }

  const transporter = createTransporter();

  const subject = type === 'register'
    ? '验证您的邮箱 - Re:Flow'
    : '重置密码验证码 - Re:Flow';

  const html = getVerificationEmailHtml(code, type);

  const info = await transporter.sendMail({
    from: config.from,
    to: email,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId };
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send a generic email
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }> {
  if (!isEmailConfigured()) {
    throw new Error('Email service is not configured');
  }

  const config = getEmailConfig();
  if (!config) {
    throw new Error('SMTP configuration is missing');
  }

  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: config.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { success: true, messageId: info.messageId };
}
