import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getQueueStatus } from '@/lib/processing/queue';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { processingQueue } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest): Promise<NextResponse> {
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
    const { searchParams } = new URL(request.url);
    const feedItemId = searchParams.get('feed_item_id');

    // If feed_item_id is provided, return status for that specific item
    if (feedItemId) {
      const itemId = parseInt(feedItemId, 10);
      if (isNaN(itemId)) {
        return NextResponse.json({ error: 'Invalid feed_item_id' }, { status: 400 });
      }

      const status = await getQueueStatus(userId, itemId);
      return NextResponse.json(status || { status: null });
    }

    // Otherwise, return overall queue statistics
    const [pendingCount] = await db
      .select({ count: count() })
      .from(processingQueue)
      .where(and(eq(processingQueue.userId, userId), eq(processingQueue.status, 'pending')));

    const [processingCount] = await db
      .select({ count: count() })
      .from(processingQueue)
      .where(and(eq(processingQueue.userId, userId), eq(processingQueue.status, 'processing')));

    const [doneCount] = await db
      .select({ count: count() })
      .from(processingQueue)
      .where(and(eq(processingQueue.userId, userId), eq(processingQueue.status, 'done')));

    const [errorCount] = await db
      .select({ count: count() })
      .from(processingQueue)
      .where(and(eq(processingQueue.userId, userId), eq(processingQueue.status, 'error')));

    return NextResponse.json({
      pending: pendingCount?.count ?? 0,
      processing: processingCount?.count ?? 0,
      done: doneCount?.count ?? 0,
      error: errorCount?.count ?? 0,
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
