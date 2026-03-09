import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { addToQueue } from '@/lib/processing/queue';

interface AddToQueueRequestBody {
  feedItemId?: number;
  templateId?: number;
  pipelineId?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(payload.sub, 10);
    const body: AddToQueueRequestBody = await request.json();
    const { feedItemId, templateId, pipelineId } = body;

    // Validate feedItemId
    if (!feedItemId || typeof feedItemId !== 'number') {
      return NextResponse.json({ error: '请选择要处理的文章' }, { status: 400 });
    }

    // Validate that exactly one of templateId or pipelineId is provided
    const hasTemplate = templateId !== undefined && templateId !== null;
    const hasPipeline = pipelineId !== undefined && pipelineId !== null;

    if (!hasTemplate && !hasPipeline) {
      return NextResponse.json({ error: '请选择模板或管道' }, { status: 400 });
    }

    if (hasTemplate && hasPipeline) {
      return NextResponse.json({ error: '只能选择模板或管道其中之一' }, { status: 400 });
    }

    // Check if there's an existing job to determine isNew flag
    // addToQueue returns existing job if one exists (pending or processing)
    // We need to check if it's a new job or existing
    const existingJob = await addToQueue({
      userId,
      feedItemId,
      templateId: hasTemplate ? templateId : null,
      pipelineId: hasPipeline ? pipelineId : null,
    });

    // Determine if this is a new job by checking if it was just created
    // A job is considered "new" if it was created within the last second
    const isNew = existingJob.status === 'pending' &&
      (Date.now() / 1000 - existingJob.createdAt) < 1;

    return NextResponse.json({
      success: true,
      jobId: existingJob.id,
      isNew,
    });
  } catch (error) {
    console.error('Error adding to queue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
