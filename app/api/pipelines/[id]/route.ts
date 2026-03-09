import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pipelines, PipelineStep } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { getCurrentUnixTimestamp } from '@/lib/time/timestamp';

// GET /api/pipelines/[id] - Get a specific pipeline
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const pipelineId = Number.parseInt(id, 10);
    if (Number.isNaN(pipelineId)) {
      return NextResponse.json({ error: '无效的管道 ID' }, { status: 400 });
    }

    // Fetch pipeline
    const pipeline = await db
      .select()
      .from(pipelines)
      .where(
        and(eq(pipelines.id, pipelineId), eq(pipelines.userId, userId)),
      )
      .limit(1);

    if (!pipeline || pipeline.length === 0) {
      return NextResponse.json({ error: '管道不存在' }, { status: 404 });
    }

    return NextResponse.json({
      ...pipeline[0],
      steps: JSON.parse(pipeline[0].steps) as PipelineStep[],
    });
  } catch (error) {
    console.error('Error fetching pipeline:', error);
    return NextResponse.json({ error: '获取管道失败' }, { status: 500 });
  }
}

// PUT /api/pipelines/[id] - Update a pipeline
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const pipelineId = Number.parseInt(id, 10);
    if (Number.isNaN(pipelineId)) {
      return NextResponse.json({ error: '无效的管道 ID' }, { status: 400 });
    }

    // Check if pipeline exists and belongs to user
    const existingPipeline = await db.query.pipelines.findFirst({
      where: and(eq(pipelines.id, pipelineId), eq(pipelines.userId, userId)),
    });

    if (!existingPipeline) {
      return NextResponse.json({ error: '管道不存在' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, steps } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: '管道名称格式无效' },
          { status: 400 },
        );
      }
      if (name.length < 3 || name.length > 50) {
        return NextResponse.json(
          { error: '管道名称长度必须为 3-50 字符' },
          { status: 400 },
        );
      }
    }

    // Validate steps if provided
    if (steps !== undefined) {
      if (!Array.isArray(steps) || steps.length === 0) {
        return NextResponse.json(
          { error: '请至少添加一个处理步骤' },
          { status: 400 },
        );
      }

      if (steps.length > 10) {
        return NextResponse.json(
          { error: '最多支持 10 个步骤' },
          { status: 400 },
        );
      }

      for (const step of steps) {
        if (
          typeof step.templateId !== 'number' ||
          typeof step.order !== 'number' ||
          typeof step.name !== 'string'
        ) {
          return NextResponse.json(
            { error: '步骤格式无效' },
            { status: 400 },
          );
        }
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: getCurrentUnixTimestamp(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (steps !== undefined) updateData.steps = JSON.stringify(steps);

    // Update pipeline
    const [updatedPipeline] = await db
      .update(pipelines)
      .set(updateData)
      .where(eq(pipelines.id, pipelineId))
      .returning();

    return NextResponse.json({
      ...updatedPipeline,
      steps: JSON.parse(updatedPipeline.steps) as PipelineStep[],
    });
  } catch (error) {
    console.error('Error updating pipeline:', error);
    return NextResponse.json({ error: '更新管道失败' }, { status: 500 });
  }
}

// DELETE /api/pipelines/[id] - Delete a pipeline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const pipelineId = Number.parseInt(id, 10);
    if (Number.isNaN(pipelineId)) {
      return NextResponse.json({ error: '无效的管道 ID' }, { status: 400 });
    }

    // Check if pipeline exists and belongs to user
    const existingPipeline = await db.query.pipelines.findFirst({
      where: and(eq(pipelines.id, pipelineId), eq(pipelines.userId, userId)),
    });

    if (!existingPipeline) {
      return NextResponse.json({ error: '管道不存在' }, { status: 404 });
    }

    // Delete pipeline
    await db.delete(pipelines).where(eq(pipelines.id, pipelineId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    return NextResponse.json({ error: '删除管道失败' }, { status: 500 });
  }
}
