import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getUserIdFromToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/feeds/[id]/mark-all-read - Mark all unread items in a feed as read
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Get user ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await context.params;
    const feedId = parseInt(id, 10);

    if (isNaN(feedId)) {
      return NextResponse.json({ error: 'Invalid feed ID' }, { status: 400 });
    }

    // Verify feed belongs to user
    const feed = await db.query.feeds.findFirst({
      where: eq(feeds.id, feedId),
      columns: { id: true, userId: true },
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    if (feed.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find all unread items for this feed
    const unreadItems = await db.query.feedItems.findMany({
      where: and(
        eq(feedItems.feedId, feedId),
        eq(feedItems.isRead, false),
      ),
      columns: { id: true },
    });

    if (unreadItems.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const itemIds = unreadItems.map((item) => item.id);

    // Update all unread items to read
    await db
      .update(feedItems)
      .set({ isRead: true })
      .where(inArray(feedItems.id, itemIds));

    // Update feed's lastUpdatedAt timestamp
    await db
      .update(feeds)
      .set({
        lastUpdatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(feeds.id, feedId));

    return NextResponse.json({ success: true, count: itemIds.length });
  } catch (error) {
    console.error('Error marking feed items as read:', error);
    return NextResponse.json({ error: 'Failed to mark items as read' }, { status: 500 });
  }
}
