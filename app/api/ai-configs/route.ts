import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiConfigs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { encrypt } from '@/lib/auth/encryption';
import { maskApiKey } from '@/lib/ai/providers';

// GET /api/ai-configs - List all AI configs for current user
export async function GET() {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    // Fetch configs with default config first
    const configs = await db.query.aiConfigs.findMany({
      where: eq(aiConfigs.userId, userId),
      orderBy: [desc(aiConfigs.isDefault), desc(aiConfigs.createdAt)],
    });

    // Mask API keys before returning
    const configsMasked = configs.map((config) => ({
      ...config,
      apiKey: maskApiKey(config.apiKeyEncrypted),
    }));

    return NextResponse.json({ configs: configsMasked });
  } catch (error) {
    console.error('Error fetching AI configs:', error);
    return NextResponse.json(
      { error: '获取 AI 配置失败' },
      { status: 500 },
    );
  }
}

// POST /api/ai-configs - Create a new AI config
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

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
      isDefault = false,
      isEnabled = true,
      extraParams,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: '配置名称不能为空' }, { status: 400 });
    }

    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: '配置名称长度必须在 3-50 个字符之间' },
        { status: 400 },
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API Key 不能为空' }, { status: 400 });
    }

    if (!model || typeof model !== 'string') {
      return NextResponse.json({ error: '模型名称不能为空' }, { status: 400 });
    }

    if (!baseURL || typeof baseURL !== 'string') {
      return NextResponse.json({ error: 'API 地址不能为空' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(baseURL);
    } catch {
      return NextResponse.json({ error: 'API 地址格式无效' }, { status: 400 });
    }

    // Encrypt API key
    const { encrypted, iv, tag } = encrypt(apiKey);

    // If setting as default, remove default flag from all other configs
    if (isDefault) {
      await db
        .update(aiConfigs)
        .set({ isDefault: false, updatedAt: Date.now() })
        .where(eq(aiConfigs.userId, userId));
    }

    // Create new config
    const [newConfig] = await db
      .insert(aiConfigs)
      .values({
        userId,
        name,
        providerType,
        providerId: providerId || null,
        apiFormat,
        baseURL,
        apiKeyEncrypted: encrypted,
        apiKeyIv: iv,
        apiKeyTag: tag,
        model,
        systemPrompt: systemPrompt || null,
        modelParams: modelParams ? JSON.stringify(modelParams) : null,
        isDefault,
        isEnabled,
        healthStatus: 'unverified',
        extraParams: extraParams ? JSON.stringify(extraParams) : null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .returning();

    // Return with masked API key
    return NextResponse.json(
      { ...newConfig, apiKey: maskApiKey(encrypted) },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating AI config:', error);
    return NextResponse.json(
      { error: '创建 AI 配置失败' },
      { status: 500 },
    );
  }
}
