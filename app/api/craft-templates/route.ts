import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { craftTemplates, aiConfigs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { getCurrentUnixTimestamp } from '@/lib/time/timestamp';

// GET /api/craft-templates - List all craft templates for current user
export async function GET() {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    // Fetch templates with AI config name
    const templates = await db
      .select({
        id: craftTemplates.id,
        userId: craftTemplates.userId,
        name: craftTemplates.name,
        description: craftTemplates.description,
        aiConfigId: craftTemplates.aiConfigId,
        aiConfigName: aiConfigs.name,
        promptTemplate: craftTemplates.promptTemplate,
        category: craftTemplates.category,
        createdAt: craftTemplates.createdAt,
        updatedAt: craftTemplates.updatedAt,
      })
      .from(craftTemplates)
      .leftJoin(aiConfigs, eq(craftTemplates.aiConfigId, aiConfigs.id))
      .where(eq(craftTemplates.userId, userId))
      .orderBy(desc(craftTemplates.createdAt));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching craft templates:', error);
    return NextResponse.json(
      { error: '获取工艺模板失败' },
      { status: 500 },
    );
  }
}

// POST /api/craft-templates - Create a new craft template
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const body = await request.json();
    const {
      name,
      description,
      aiConfigId,
      promptTemplate,
      category = 'custom',
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: '模板名称不能为空' }, { status: 400 });
    }

    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: '模板名称长度必须在 3-50 个字符之间' },
        { status: 400 },
      );
    }

    if (!promptTemplate || typeof promptTemplate !== 'string') {
      return NextResponse.json(
        { error: 'Prompt 模板不能为空' },
        { status: 400 },
      );
    }

    if (!aiConfigId || typeof aiConfigId !== 'number') {
      return NextResponse.json(
        { error: '请选择关联的 AI 配置' },
        { status: 400 },
      );
    }

    // Validate category
    const validCategories = [
      'summarize',
      'translate',
      'filter',
      'analyze',
      'rewrite',
      'custom',
    ];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: '无效的分类' }, { status: 400 });
    }

    // Verify AI config exists and belongs to user
    const aiConfig = await db.query.aiConfigs.findFirst({
      where: eq(aiConfigs.id, aiConfigId),
    });

    if (!aiConfig) {
      return NextResponse.json(
        { error: 'AI 配置不存在' },
        { status: 404 },
      );
    }

    if (aiConfig.userId !== userId) {
      return NextResponse.json(
        { error: '无权使用此 AI 配置' },
        { status: 403 },
      );
    }

    const currentTimestamp = getCurrentUnixTimestamp();

    // Create new template
    const [newTemplate] = await db
      .insert(craftTemplates)
      .values({
        userId,
        name,
        description: description || null,
        aiConfigId,
        promptTemplate,
        category,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating craft template:', error);
    return NextResponse.json(
      { error: '创建工艺模板失败' },
      { status: 500 },
    );
  }
}
