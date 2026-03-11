import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { db } from '@/lib/db';
import { mcpTokens } from '@/lib/db/schema';
import { toMCPTokenResponseRecord } from '@/lib/mcp/token-records';
import { getCurrentUnixTimestamp } from '@/lib/time/timestamp';

async function getOwnedToken(userId: number, id: string) {
  const tokenId = Number.parseInt(id, 10);
  if (Number.isNaN(tokenId)) {
    return {
      tokenId: null,
      response: NextResponse.json({ error: '无效的 token ID' }, { status: 400 }),
    };
  }

  const token = await db.query.mcpTokens.findFirst({
    where: and(eq(mcpTokens.id, tokenId), eq(mcpTokens.userId, userId)),
  });

  if (!token) {
    return {
      tokenId,
      response: NextResponse.json({ error: 'MCP token 不存在' }, { status: 404 }),
    };
  }

  return {
    tokenId,
    token,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const result = await getOwnedToken(userId, id);
    if ('response' in result) {
      return result.response;
    }

    return NextResponse.json(toMCPTokenResponseRecord(result.token));
  } catch (error) {
    console.error('Error fetching MCP token detail:', error);
    return NextResponse.json({ error: '获取 MCP token 详情失败' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const result = await getOwnedToken(userId, id);
    if ('response' in result) {
      return result.response;
    }

    const body = await request.json().catch(() => ({}));
    if (body.action !== 'toggle') {
      return NextResponse.json({ error: '不支持的操作' }, { status: 400 });
    }

    const [updated] = await db
      .update(mcpTokens)
      .set({
        isEnabled: !result.token.isEnabled,
        updatedAt: getCurrentUnixTimestamp(),
      })
      .where(eq(mcpTokens.id, result.token.id))
      .returning();

    return NextResponse.json(toMCPTokenResponseRecord(updated));
  } catch (error) {
    console.error('Error toggling MCP token:', error);
    return NextResponse.json({ error: '切换 MCP token 状态失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const result = await getOwnedToken(userId, id);
    if ('response' in result) {
      return result.response;
    }

    await db.delete(mcpTokens).where(eq(mcpTokens.id, result.token.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting MCP token:', error);
    return NextResponse.json({ error: '删除 MCP token 失败' }, { status: 500 });
  }
}
