import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { craftTemplates, aiConfigs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// GET /api/craft-templates/[id] - Get a specific craft template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const templateId = Number.parseInt(id, 10);
    if (Number.isNaN(templateId)) {
      return NextResponse.json({ error: '无效的模板 ID' }, { status: 400 });
    }

    // Fetch template with AI config
    const template = await db
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
      .where(
        and(
          eq(craftTemplates.id, templateId),
          eq(craftTemplates.userId, userId),
        ),
      )
      .limit(1);

    if (!template || template.length === 0) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 });
    }

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error('Error fetching craft template:', error);
    return NextResponse.json(
      { error: '获取工艺模板失败' },
      { status: 500 },
    );
  }
}

// PUT /api/craft-templates/[id] - Update a craft template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const templateId = Number.parseInt(id, 10);
    if (Number.isNaN(templateId)) {
      return NextResponse.json({ error: '无效的模板 ID' }, { status: 400 });
    }

    // Check if template exists and belongs to user
    const existingTemplate = await db.query.craftTemplates.findFirst({
      where: and(
        eq(craftTemplates.id, templateId),
        eq(craftTemplates.userId, userId),
      ),
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      aiConfigId,
      promptTemplate,
      category,
    } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: '模板名称格式无效' },
          { status: 400 },
        );
      }
      if (name.length < 3 || name.length > 50) {
        return NextResponse.json(
          { error: '模板名称长度必须在 3-50 个字符之间' },
          { status: 400 },
        );
      }
    }

    // Validate prompt template if provided
    if (promptTemplate !== undefined && typeof promptTemplate !== 'string') {
      return NextResponse.json(
        { error: 'Prompt 模板格式无效' },
        { status: 400 },
      );
    }

    // Validate AI config ID if provided
    if (aiConfigId !== undefined) {
      if (typeof aiConfigId !== 'number') {
        return NextResponse.json(
          { error: 'AI 配置 ID 格式无效' },
          { status: 400 },
        );
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
    }

    // Validate category if provided
    if (category !== undefined) {
      const validCategories = [
        'summarize',
        'translate',
        'filter',
        'analyze',
        'rewrite',
        'custom',
      ];
      if (!validCategories.includes(category)) {
        return NextResponse.json({ error: '无效的分类' }, { status: 400 });
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (aiConfigId !== undefined) updateData.aiConfigId = aiConfigId;
    if (promptTemplate !== undefined) updateData.promptTemplate = promptTemplate;
    if (category !== undefined) updateData.category = category;

    // Update template
    const [updatedTemplate] = await db
      .update(craftTemplates)
      .set(updateData)
      .where(eq(craftTemplates.id, templateId))
      .returning();

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating craft template:', error);
    return NextResponse.json(
      { error: '更新工艺模板失败' },
      { status: 500 },
    );
  }
}

// DELETE /api/craft-templates/[id] - Delete a craft template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const templateId = Number.parseInt(id, 10);
    if (Number.isNaN(templateId)) {
      return NextResponse.json({ error: '无效的模板 ID' }, { status: 400 });
    }

    // Check if template exists and belongs to user
    const existingTemplate = await db.query.craftTemplates.findFirst({
      where: and(
        eq(craftTemplates.id, templateId),
        eq(craftTemplates.userId, userId),
      ),
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 });
    }

    // Delete template
    await db
      .delete(craftTemplates)
      .where(eq(craftTemplates.id, templateId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting craft template:', error);
    return NextResponse.json(
      { error: '删除工艺模板失败' },
      { status: 500 },
    );
  }
}
