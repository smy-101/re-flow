import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/items/[id] - Get a single item by ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const { id } = await context.params;
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

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}
