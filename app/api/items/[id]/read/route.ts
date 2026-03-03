import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/items/[id]/read - Mark item as read/unread
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await context.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== 'boolean') {
      return NextResponse.json({ error: 'isRead must be a boolean' }, { status: 400 });
    }

    // Get user's feed IDs
    const userFeeds = await db.query.feeds.findMany({
      where: eq(feeds.userId, userId),
      columns: { id: true },
    });

    const userFeedIds = userFeeds.map((f) => f.id);

    // Fetch item
    const item = await db.query.feedItems.findFirst({
      where: and(
        eq(feedItems.id, itemId),
        inArray(feedItems.feedId, userFeedIds),
      ),
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Update item read status
    const [updatedItem] = await db
      .update(feedItems)
      .set({ isRead })
      .where(eq(feedItems.id, itemId))
      .returning();

    // Update feed's lastUpdated timestamp (unreadCount is calculated on fetch)
    await db
      .update(feeds)
      .set({
        lastUpdatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(feeds.id, item.feedId));

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item read status:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
