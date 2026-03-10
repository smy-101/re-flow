import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { verifyCode, cleanupCodes } from '@/lib/auth/verification';
import { checkVerificationRateLimit, resetVerificationRateLimit } from '@/lib/auth/rate-limit';
import { getClientIp } from '@/lib/auth/ip';
import { eq } from 'drizzle-orm';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body as {
      email: string;
      code: string;
      newPassword: string;
    };

    // Validate request body
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: '请提供邮箱、验证码和新密码' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // Validate new password
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: '密码至少需要 8 个字符' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const ip = getClientIp(request);

    // Check verification rate limit
    const rateLimitResult = checkVerificationRateLimit(email, ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: '验证次数过多，请 15 分钟后重试' },
        { status: 429 }
      );
    }

    // Verify the verification code
    const codeResult = await verifyCode(email, code, 'reset_password');
    if (!codeResult.valid) {
      return NextResponse.json(
        { error: codeResult.error || '验证码错误' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      // For security, don't reveal whether email exists
      // But still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: '密码重置成功',
      });
    }

    // Hash new password and update user
    const passwordHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id))
      .execute();

    // Clean up verification codes for this email
    await cleanupCodes(email, 'reset_password');

    // Reset rate limits after successful password reset
    resetVerificationRateLimit(email, ip);

    return NextResponse.json({
      success: true,
      message: '密码重置成功',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: '密码重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}
