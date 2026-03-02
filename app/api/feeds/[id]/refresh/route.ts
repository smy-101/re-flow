import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserIdFromToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { fetchAndStoreItems } from '@/lib/rss/fetcher';

interface RefreshResult {
  success: boolean;
  itemsAdded: number;
  error?: string;
}

// POST /api/feeds/[id]/refresh - Manually refresh a single feed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const feedId = parseInt(id, 10);

    if (isNaN(feedId)) {
      return NextResponse.json({ error: 'Invalid feed ID' }, { status: 400 });
    }

    // Check if feed exists and belongs to user
    const feed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, feedId), eq(feeds.userId, userId)),
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Fetch and store items
    const result: RefreshResult = await fetchAndStoreItems(feedId, userId, feed.feedUrl);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to refresh feed',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      itemsAdded: result.itemsAdded,
    });
  } catch (error) {
    console.error('Error refreshing feed:', error);
    return NextResponse.json(
      { error: 'Failed to refresh feed', success: false },
      { status: 500 }
    );
  }
}
