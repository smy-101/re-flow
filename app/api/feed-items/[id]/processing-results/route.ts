import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  processingResults,
  feedItems,
  craftTemplates,
  pipelines,
  type StepOutput,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// GET /api/feed-items/[id]/processing-results - Get processing history for a feed item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await params;
    const feedItemId = parseInt(id, 10);

    if (isNaN(feedItemId)) {
      return NextResponse.json({ error: '无效的文章 ID' }, { status: 400 });
    }

    // Verify the feed item exists and belongs to the user
    const item = await db.query.feedItems.findFirst({
      where: eq(feedItems.id, feedItemId),
    });

    if (!item) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    if (item.userId !== userId) {
      return NextResponse.json(
        { error: '无权访问此文章' },
        { status: 403 },
      );
    }

    // Fetch all processing results for this feed item
    const results = await db
      .select()
      .from(processingResults)
      .where(eq(processingResults.feedItemId, feedItemId))
      .orderBy(desc(processingResults.createdAt));

    // Fetch template and pipeline names for each result
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
    console.error('Error fetching processing history:', error);
    return NextResponse.json(
      { error: '获取处理历史失败' },
      { status: 500 },
    );
  }
}
