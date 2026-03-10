import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { getClientIp } from '@/lib/auth/ip';
import {
  generateVerificationCode,
  storeVerificationCode,
  canSendCode,
} from '@/lib/auth/verification';
import { sendVerificationEmail, isEmailConfigured } from '@/lib/auth/email';
import type { VerificationCodeType } from '@/lib/db/schema';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  console.log('Received send code request',request);
  try {
    const body = await request.json();
    const { email, type } = body as { email: string; type: VerificationCodeType };

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // Validate type
    if (type !== 'register' && type !== 'reset_password') {
      return NextResponse.json(
        { error: '无效的验证码类型' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const _ip = getClientIp(request);

    // Check send rate limit (60 seconds interval)
    const rateLimitKey = `send-code:${email}:${type}`;
    const rateLimit = checkRateLimit(rateLimitKey, {
      windowMs: 60 * 1000, // 60 seconds
      maxRequests: 1, // Only 1 request per 60 seconds
    });

    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: '验证码已发送，请 60 秒后重试',
          waitSeconds,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Check if we can send a new code (database-level check)
    const sendCheck = await canSendCode(email, type);
    if (!sendCheck.canSend && sendCheck.waitSeconds) {
      return NextResponse.json(
        {
          error: '验证码已发送，请稍后重试',
          waitSeconds: sendCheck.waitSeconds,
        },
        { status: 429 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Store verification code in database
    await storeVerificationCode(email, code, type);

    // Send verification email
    if (isEmailConfigured()) {
      try {
        await sendVerificationEmail(email, code, type);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return NextResponse.json(
          { error: '发送验证码失败，请稍后重试' },
          { status: 500 }
        );
      }
    } else {
      // In development, log the code instead
      console.log(`[DEV] Verification code for ${email} (${type}): ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}
