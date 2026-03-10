import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { verifyCode, cleanupCodes } from '@/lib/auth/verification';
import { eq } from 'drizzle-orm';
import { signToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, code, nickname } = body as {
      email: string;
      password: string;
      code: string;
      nickname?: string;
    };

    // Validate request body
    if (!email || !password || !code) {
      return NextResponse.json(
        { error: '请提供邮箱、密码和验证码' },
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

    // Validate password
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: '密码至少需要 8 个字符' },
        { status: 400 }
      );
    }

    // Verify the verification code
    const codeResult = await verifyCode(email, code, 'register');
    if (!codeResult.valid) {
      return NextResponse.json(
        { error: codeResult.error || '验证码错误' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // Determine nickname: use provided value or extract from email
    const userNickname = nickname?.trim() || email.split('@')[0];

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const newUser = await db
      .insert(users)
      .values({
        email,
        nickname: userNickname,
        passwordHash,
        emailVerified: true, // Email is verified since they used verification code
      })
      .returning()
      .get();

    // Clean up verification codes for this email
    await cleanupCodes(email, 'register');

    // Sign JWT and set cookie
    const token = await signToken(newUser.id);
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          nickname: newUser.nickname,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
