import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { createMCPTokenRecord } from '@/lib/auth/mcp-token';
import { db } from '@/lib/db';
import { mcpTokens } from '@/lib/db/schema';
import { toMCPTokenResponseRecord } from '@/lib/mcp/token-records';

function validateFeedIds(feedIds: unknown): number[] | null {
  if (feedIds === undefined || feedIds === null || feedIds === '') {
    return null;
  }

  if (!Array.isArray(feedIds)) {
    throw new Error('订阅白名单必须是数字数组');
  }

  const parsed = feedIds.map((value) => Number(value));
  if (parsed.some((value) => !Number.isInteger(value) || value <= 0)) {
    throw new Error('订阅白名单必须只包含正整数');
  }

  return [...new Set(parsed)];
}

function validateTimeWindowDays(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('时间窗口必须是正整数天数');
  }

  return parsed;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const tokens = await db.query.mcpTokens.findMany({
      where: eq(mcpTokens.userId, userId),
      orderBy: [desc(mcpTokens.createdAt)],
    });

    return NextResponse.json({
      tokens: tokens.map(toMCPTokenResponseRecord),
    });
  } catch (error) {
    console.error('Error fetching MCP tokens:', error);
    return NextResponse.json({ error: '获取 MCP token 列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: '名称长度必须在 2 到 50 个字符之间' },
        { status: 400 },
      );
    }

    let feedIds: number[] | null;
    let timeWindowDays: number | null;
    try {
      feedIds = validateFeedIds(body.feedIds);
      timeWindowDays = validateTimeWindowDays(body.timeWindowDays);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : '参数无效' },
        { status: 400 },
      );
    }

    const allowRawFallback = body.allowRawFallback !== false;
    const created = await createMCPTokenRecord({
      userId,
      name,
      feedIds,
      timeWindowDays,
      allowRawFallback,
    });

    return NextResponse.json(
      {
        ...toMCPTokenResponseRecord(created.token),
        secret: created.secret,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating MCP token:', error);
    return NextResponse.json({ error: '创建 MCP token 失败' }, { status: 500 });
  }
}
