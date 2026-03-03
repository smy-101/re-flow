import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, inArray, count } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// GET /api/favorites/count - Get favorite items count for current user
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
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

    // Count favorite items
    const result = await db
      .select({ count: count() })
      .from(feedItems)
      .where(
        and(
          inArray(feedItems.feedId, userFeedIds),
          eq(feedItems.isFavorite, true),
        ),
      );

    const favoriteCount = result[0]?.count || 0;

    return NextResponse.json({ count: favoriteCount });
  } catch (error) {
    console.error('Error fetching favorite count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite count' },
      { status: 500 },
    );
  }
}
