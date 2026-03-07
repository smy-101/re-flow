import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pipelines, PipelineStep } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// GET /api/pipelines - List all pipelines for current user
export async function GET() {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    // Fetch pipelines
    const pipelineList = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.userId, userId))
      .orderBy(desc(pipelines.createdAt));

    // Parse steps JSON for each pipeline
    const parsedPipelines = pipelineList.map((pipeline) => ({
      ...pipeline,
      steps: JSON.parse(pipeline.steps) as PipelineStep[],
    }));

    return NextResponse.json({ pipelines: parsedPipelines });
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    return NextResponse.json(
      { error: '获取管道列表失败' },
      { status: 500 },
    );
  }
}

// POST /api/pipelines - Create a new pipeline
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const body = await request.json();
    const { name, description, steps } = body;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: '管道名称不能为空' }, { status: 400 });
    }

    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: '管道名称长度必须为 3-50 字符' },
        { status: 400 },
      );
    }

    // Validate steps
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
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

    // Validate each step has required fields
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

    // Create new pipeline
    const [newPipeline] = await db
      .insert(pipelines)
      .values({
        userId,
        name,
        description: description || null,
        steps: JSON.stringify(steps),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .returning();

    return NextResponse.json(
      {
        ...newPipeline,
        steps: JSON.parse(newPipeline.steps) as PipelineStep[],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating pipeline:', error);
    return NextResponse.json({ error: '创建管道失败' }, { status: 500 });
  }
}
