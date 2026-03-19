import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/items/[id]/favorite - Toggle item favorite status
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    // Parallel: auth + params
    const [userIdResult, { id }] = await Promise.all([
      getAuthenticatedUser(),
      context.params,
    ]);
    if (userIdResult instanceof NextResponse) return userIdResult;
    const userId = userIdResult;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
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

    // Toggle favorite status
    const newFavoriteStatus = !item.isFavorite;
    const [updatedItem] = await db
      .update(feedItems)
      .set({ isFavorite: newFavoriteStatus })
      .where(eq(feedItems.id, itemId))
      .returning();

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error toggling item favorite:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
