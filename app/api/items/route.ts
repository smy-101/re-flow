import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { getUserIdFromToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// GET /api/items - List items with optional filters
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const feedId = searchParams.get('feedId');
    const isRead = searchParams.get('isRead');
    const isFavorite = searchParams.get('isFavorite');

    // Get user's feed IDs
    const userFeeds = await db.query.feeds.findMany({
      where: eq(feeds.userId, userId),
      columns: { id: true },
    });

    const userFeedIds = userFeeds.map((f) => f.id);

    // Build query conditions
    const conditions = [inArray(feedItems.feedId, userFeedIds)];

    if (feedId) {
      const feedIdNum = parseInt(feedId, 10);
      if (!isNaN(feedIdNum)) {
        conditions.push(eq(feedItems.feedId, feedIdNum));
      }
    }

    if (isRead !== null) {
      const isReadBool = isRead === 'true';
      conditions.push(eq(feedItems.isRead, isReadBool));
    }

    if (isFavorite !== null) {
      const isFavoriteBool = isFavorite === 'true';
      conditions.push(eq(feedItems.isFavorite, isFavoriteBool));
    }

    // Fetch items
    const items = await db.query.feedItems.findMany({
      where: and(...conditions),
      orderBy: [desc(feedItems.publishedAt)],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}
