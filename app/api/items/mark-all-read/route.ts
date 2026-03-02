import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getUserIdFromToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// POST /api/items/mark-all-read - Mark all unread items as read
export async function POST() {
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

    // Get user's feed IDs
    const userFeeds = await db.query.feeds.findMany({
      where: eq(feeds.userId, userId),
      columns: { id: true },
    });

    const userFeedIds = userFeeds.map((f) => f.id);

    if (userFeedIds.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Find all unread items for user's feeds
    const unreadItems = await db.query.feedItems.findMany({
      where: and(
        inArray(feedItems.feedId, userFeedIds),
        eq(feedItems.isRead, false),
      ),
      columns: { id: true, feedId: true },
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

    // Update lastUpdatedAt for all affected feeds
    const affectedFeedIds = [...new Set(unreadItems.map((item) => item.feedId))];
    await db
      .update(feeds)
      .set({
        lastUpdatedAt: Math.floor(Date.now() / 1000),
      })
      .where(inArray(feeds.id, affectedFeedIds));

    return NextResponse.json({ success: true, count: itemIds.length });
  } catch (error) {
    console.error('Error marking all items as read:', error);
    return NextResponse.json({ error: 'Failed to mark items as read' }, { status: 500 });
  }
}
