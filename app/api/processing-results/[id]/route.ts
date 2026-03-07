import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  processingResults,
  craftTemplates,
  pipelines,
  type StepOutput,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// GET /api/processing-results/[id] - Get a single processing result
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const resultId = parseInt(id, 10);

    if (isNaN(resultId)) {
      return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
    }

    // Fetch the processing result
    const result = await db.query.processingResults.findFirst({
      where: eq(processingResults.id, resultId),
    });

    if (!result) {
      return NextResponse.json({ error: '处理结果不存在' }, { status: 404 });
    }

    // Verify the result belongs to the user
    if (result.userId !== userId) {
      return NextResponse.json(
        { error: '无权访问此处理结果' },
        { status: 403 },
      );
    }

    // Fetch template and pipeline names
    let templateName: string | null = null;
    let pipelineName: string | null = null;

    if (result.templateId) {
      const template = await db.query.craftTemplates.findFirst({
        where: eq(craftTemplates.id, result.templateId),
        columns: { name: true },
      });
      templateName = template?.name ?? null;
    }

    if (result.pipelineId) {
      const pipeline = await db.query.pipelines.findFirst({
        where: eq(pipelines.id, result.pipelineId),
        columns: { name: true },
      });
      pipelineName = pipeline?.name ?? null;
    }

    return NextResponse.json({
      ...result,
      stepsOutput: result.stepsOutput
        ? (JSON.parse(result.stepsOutput) as StepOutput[])
        : null,
      templateName,
      pipelineName,
    });
  } catch (error) {
    console.error('Error fetching processing result:', error);
    return NextResponse.json(
      { error: '获取处理结果失败' },
      { status: 500 },
    );
  }
}
