import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { eq } from 'drizzle-orm';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate request body
    if (!username || !password) {
      return NextResponse.json(
        { error: '请提供用户名和密码' },
        { status: 400 }
      );
    }

    // Validate username
    if (!USERNAME_REGEX.test(username)) {
      if (username.length < 3) {
        return NextResponse.json(
          { error: '用户名至少需要 3 个字符' },
          { status: 400 }
        );
      }
      if (username.length > 20) {
        return NextResponse.json(
          { error: '用户名最多 20 个字符' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: '用户名只能包含字母、数字和下划线' },
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

    // Check for duplicate username
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (existingUser) {
      return NextResponse.json(
        { error: '该用户名已被占用' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const newUser = await db
      .insert(users)
      .values({
        username,
        passwordHash,
      })
      .returning()
      .get();

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          username: newUser.username,
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
