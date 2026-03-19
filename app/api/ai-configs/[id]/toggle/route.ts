import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiConfigs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { maskApiKey } from '@/lib/ai/providers';
import { getCurrentUnixTimestamp } from '@/lib/time/timestamp';

// PUT /api/ai-configs/[id]/toggle - Toggle enabled state of an AI config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Parallel: auth + params
    const [userIdResult, { id }] = await Promise.all([
      getAuthenticatedUser(),
      params,
    ]);
    if (userIdResult instanceof NextResponse) return userIdResult;
    const userId = userIdResult;
    const configId = Number.parseInt(id, 10);
    if (Number.isNaN(configId)) {
      return NextResponse.json({ error: '无效的配置 ID' }, { status: 400 });
    }

    // Check if config exists and belongs to user
    const existingConfig = await db.query.aiConfigs.findFirst({
      where: and(eq(aiConfigs.id, configId), eq(aiConfigs.userId, userId)),
    });

    if (!existingConfig) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }

    // Toggle enabled state
    const [updatedConfig] = await db
      .update(aiConfigs)
      .set({
        isEnabled: !existingConfig.isEnabled,
        updatedAt: getCurrentUnixTimestamp(),
      })
      .where(eq(aiConfigs.id, configId))
      .returning();

    // Return with masked API key
    return NextResponse.json({
      ...updatedConfig,
      apiKey: maskApiKey(updatedConfig.apiKeyEncrypted),
    });
  } catch (error) {
    console.error('Error toggling AI config:', error);
    return NextResponse.json(
      { error: '切换配置状态失败' },
      { status: 500 },
    );
  }
}
