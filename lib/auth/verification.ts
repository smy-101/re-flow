import { db } from '@/lib/db';
import { verificationCodes, type VerificationCodeType } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const CODE_EXPIRY_SECONDS = 10 * 60; // 10 minutes
const SEND_INTERVAL_SECONDS = 60; // 60 seconds between sends

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  const code = Math.floor(Math.random() * 1000000);
  return code.toString().padStart(6, '0');
}

/**
 * Store a verification code in the database
 */
export async function storeVerificationCode(
  email: string,
  code: string,
  type: VerificationCodeType,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + CODE_EXPIRY_SECONDS;

  await db.insert(verificationCodes).values({
    email,
    code,
    type,
    expiresAt,
  });
}

/**
 * Verify a code for an email and type
 */
export async function verifyCode(
  email: string,
  code: string,
  type: VerificationCodeType,
): Promise<{ valid: boolean; error?: string }> {
  const now = Math.floor(Date.now() / 1000);

  const records = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.code, code),
        eq(verificationCodes.type, type),
      ),
    )
    .execute();

  if (records.length === 0) {
    return { valid: false, error: '验证码错误' };
  }

  const record = records[0];

  if (record.expiresAt < now) {
    return { valid: false, error: '验证码已过期，请重新获取' };
  }

  return { valid: true };
}

/**
 * Delete all codes for an email and type
 */
export async function cleanupCodes(
  email: string,
  type: VerificationCodeType,
): Promise<void> {
  await db
    .delete(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.type, type),
      ),
    )
    .execute();
}

/**
 * Check if a new code can be sent (60 second interval)
 */
export async function canSendCode(
  email: string,
  type: VerificationCodeType,
): Promise<{ canSend: boolean; waitSeconds?: number }> {
  const now = Math.floor(Date.now() / 1000);
  const minCreatedTime = now - SEND_INTERVAL_SECONDS;

  const records = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.type, type),
      ),
    )
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1)
    .execute();

  if (records.length === 0) {
    return { canSend: true };
  }

  const latestCode = records[0];

  if (latestCode.createdAt > minCreatedTime) {
    const waitSeconds = latestCode.createdAt - minCreatedTime;
    return { canSend: false, waitSeconds };
  }

  return { canSend: true };
}
