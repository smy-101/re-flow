import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// POST /api/items/mark-all-read - Mark all unread items as read
export async function POST() {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

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
