import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiConfigs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { getCurrentUnixTimestamp } from '@/lib/time/timestamp';

// PUT /api/ai-configs/[id]/set-default - Set an AI config as default
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
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

    const currentTimestamp = getCurrentUnixTimestamp();

    // Remove default flag from all configs
    await db
      .update(aiConfigs)
      .set({ isDefault: false, updatedAt: currentTimestamp })
      .where(eq(aiConfigs.userId, userId));

    // Set this config as default
    const [updatedConfig] = await db
      .update(aiConfigs)
      .set({ isDefault: true, updatedAt: currentTimestamp })
      .where(eq(aiConfigs.id, configId))
      .returning();

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error setting default AI config:', error);
    return NextResponse.json(
      { error: '设置默认配置失败' },
      { status: 500 },
    );
  }
}
