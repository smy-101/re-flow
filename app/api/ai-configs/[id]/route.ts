import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiConfigs, craftTemplates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { encrypt } from '@/lib/auth/encryption';
import { maskApiKey } from '@/lib/ai/providers';

// GET /api/ai-configs/[id] - Get a specific AI config
export async function GET(
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

    // Return with masked API key
    return NextResponse.json({ ...config, apiKey: maskApiKey(config.apiKeyEncrypted) });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    return NextResponse.json(
      { error: '获取 AI 配置失败' },
      { status: 500 },
    );
  }
}

// PUT /api/ai-configs/[id] - Update an AI config
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

    const body = await request.json();
    const {
      name,
      providerType,
      providerId,
      apiFormat,
      baseURL,
      apiKey,
      model,
      systemPrompt,
      modelParams,
      isEnabled,
      extraParams,
    } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 3 || name.length > 50) {
        return NextResponse.json(
          { error: '配置名称长度必须在 3-50 个字符之间' },
          { status: 400 },
        );
      }
    }

    // Validate API key if provided
    if (apiKey !== undefined && typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API Key 格式无效' }, { status: 400 });
    }

    // Validate model if provided
    if (model !== undefined && (typeof model !== 'string' || !model.trim())) {
      return NextResponse.json({ error: '模型名称不能为空' }, { status: 400 });
    }

    // Validate base URL if provided
    if (baseURL !== undefined) {
      if (typeof baseURL !== 'string' || !baseURL.trim()) {
        return NextResponse.json({ error: 'API 地址不能为空' }, { status: 400 });
      }
      try {
        new URL(baseURL);
      } catch {
        return NextResponse.json({ error: 'API 地址格式无效' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
      healthStatus: 'unverified',
      lastError: null,
      lastErrorAt: null,
    };

    if (name !== undefined) updateData.name = name;
    if (providerType !== undefined) updateData.providerType = providerType;
    if (providerId !== undefined) updateData.providerId = providerId;
    if (apiFormat !== undefined) updateData.apiFormat = apiFormat;
    if (baseURL !== undefined) updateData.baseURL = baseURL;
    if (model !== undefined) updateData.model = model;
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
    if (modelParams !== undefined) {
      updateData.modelParams = modelParams ? JSON.stringify(modelParams) : null;
    }
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;
    if (extraParams !== undefined) {
      updateData.extraParams = extraParams ? JSON.stringify(extraParams) : null;
    }

    // Encrypt new API key if provided
    if (apiKey !== undefined) {
      const { encrypted, iv, tag } = encrypt(apiKey);
      updateData.apiKeyEncrypted = encrypted;
      updateData.apiKeyIv = iv;
      updateData.apiKeyTag = tag;
    }

    // Update config
    const [updatedConfig] = await db
      .update(aiConfigs)
      .set(updateData)
      .where(eq(aiConfigs.id, configId))
      .returning();

    // Return with masked API key
    return NextResponse.json({
      ...updatedConfig,
      apiKey: maskApiKey(updatedConfig.apiKeyEncrypted),
    });
  } catch (error) {
    console.error('Error updating AI config:', error);
    return NextResponse.json(
      { error: '更新 AI 配置失败' },
      { status: 500 },
    );
  }
}

// DELETE /api/ai-configs/[id] - Delete an AI config
export async function DELETE(
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

    // Check if there are any craft templates associated with this config
    const associatedTemplates = await db.query.craftTemplates.findMany({
      where: eq(craftTemplates.aiConfigId, configId),
      columns: {
        id: true,
        name: true,
      },
    });

    if (associatedTemplates.length > 0) {
      return NextResponse.json(
        {
          error: `无法删除：该 AI 配置被 ${associatedTemplates.length} 个工艺模板使用`,
          templates: associatedTemplates,
        },
        { status: 400 },
      );
    }

    // Delete config
    await db.delete(aiConfigs).where(eq(aiConfigs.id, configId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI config:', error);
    return NextResponse.json(
      { error: '删除 AI 配置失败' },
      { status: 500 },
    );
  }
}
