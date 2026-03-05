import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiConfigs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { decrypt } from '@/lib/auth/encryption';
import { testAIConfig } from '@/lib/ai/test';
import type { AIConfigInput } from '@/lib/ai/providers';

// POST /api/ai-configs/[id]/test - Test an AI config
export async function POST(
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

    // Fetch config
    const config = await db.query.aiConfigs.findFirst({
      where: and(eq(aiConfigs.id, configId), eq(aiConfigs.userId, userId)),
    });

    if (!config) {
      return NextResponse.json({ error: '配置不存在' }, { status: 404 });
    }

    // Decrypt API key
    const apiKey = decrypt(config.apiKeyEncrypted, config.apiKeyIv, config.apiKeyTag);

    // Build config for testing
    const testConfig: AIConfigInput = {
      name: config.name,
      providerType: config.providerType as AIConfigInput['providerType'],
      providerId: config.providerId || undefined,
      apiFormat: config.apiFormat as AIConfigInput['apiFormat'],
      baseURL: config.baseURL,
      apiKey,
      model: config.model,
      systemPrompt: config.systemPrompt || undefined,
      modelParams: config.modelParams
        ? (JSON.parse(config.modelParams) as AIConfigInput['modelParams'])
        : undefined,
      extraParams: config.extraParams
        ? (JSON.parse(config.extraParams) as AIConfigInput['extraParams'])
        : undefined,
    };
    // Run test
    const result = await testAIConfig(testConfig);

    // Update health status based on test result
    if (result.success) {
      await db
        .update(aiConfigs)
        .set({
          healthStatus: 'active',
          lastError: null,
          lastErrorAt: null,
          updatedAt: Date.now(),
        })
        .where(eq(aiConfigs.id, configId));
    } else {
      await db
        .update(aiConfigs)
        .set({
          healthStatus: 'error',
          lastError: result.error || '测试失败',
          lastErrorAt: Date.now(),
          updatedAt: Date.now(),
        })
        .where(eq(aiConfigs.id, configId));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing AI config:', error);

    // Update with error status
    const { id } = await params;
    const configId = Number.parseInt(id, 10);
    if (!Number.isNaN(configId)) {
      try {
        await db
          .update(aiConfigs)
          .set({
            healthStatus: 'error',
            lastError: error instanceof Error ? error.message : '测试失败',
            lastErrorAt: Date.now(),
            updatedAt: Date.now(),
          })
          .where(eq(aiConfigs.id, configId));
      } catch (updateError) {
        console.error('Error updating test result:', updateError);
      }
    }

    return NextResponse.json({ error: '测试配置失败' }, { status: 500 });
  }
}
