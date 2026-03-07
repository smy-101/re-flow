import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  processingResults,
  craftTemplates,
  pipelines,
  type StepOutput,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// GET /api/processing-results - List all processing results for current user
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let results = await db
      .select()
      .from(processingResults)
      .where(eq(processingResults.userId, userId))
      .orderBy(desc(processingResults.createdAt))
      .limit(limit)
      .offset(offset);

    // Filter by status if provided
    if (status && ['pending', 'processing', 'done', 'error'].includes(status)) {
      results = results.filter((r) => r.status === status);
    }

    // Fetch template and pipeline names
    const resultsWithNames = await Promise.all(
      results.map(async (result) => {
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

        return {
          ...result,
          stepsOutput: result.stepsOutput
            ? (JSON.parse(result.stepsOutput) as StepOutput[])
            : null,
          templateName,
          pipelineName,
        };
      }),
    );

    return NextResponse.json({ results: resultsWithNames });
  } catch (error) {
    console.error('Error fetching processing results:', error);
    return NextResponse.json(
      { error: '获取处理结果失败' },
      { status: 500 },
    );
  }
}
