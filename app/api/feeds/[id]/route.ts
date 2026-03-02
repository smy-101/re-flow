import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds, feedItems } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserIdFromToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/feeds/[id] - Get a single feed by ID
export async function GET(request: NextRequest, context: RouteContext) {
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

    // Fetch feed
    const feed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, feedId), eq(feeds.userId, userId)),
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Calculate unread count
    const unreadCount = await db
      .select({ count: feedItems.id })
      .from(feedItems)
      .where(and(eq(feedItems.feedId, feedId), eq(feedItems.isRead, false)));

    const feedWithUnread = {
      ...feed,
      unreadCount: unreadCount.length,
    };

    return NextResponse.json(feedWithUnread);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

// PUT /api/feeds/[id] - Update a feed
export async function PUT(request: NextRequest, context: RouteContext) {
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

    // Check if feed exists and belongs to user
    const existingFeed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, feedId), eq(feeds.userId, userId)),
    });

    if (!existingFeed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, category } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      lastUpdatedAt: Math.floor(Date.now() / 1000),
    };

    if (title !== undefined) {
      updateData.title = title;
    }
    if (category !== undefined) {
      updateData.category = category;
    }

    // Update feed
    const [updatedFeed] = await db
      .update(feeds)
      .set(updateData)
      .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)))
      .returning();

    return NextResponse.json(updatedFeed);
  } catch (error) {
    console.error('Error updating feed:', error);
    return NextResponse.json({ error: 'Failed to update feed' }, { status: 500 });
  }
}

// DELETE /api/feeds/[id] - Delete a feed
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    // Check if feed exists and belongs to user
    const existingFeed = await db.query.feeds.findFirst({
      where: and(eq(feeds.id, feedId), eq(feeds.userId, userId)),
    });

    if (!existingFeed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Delete feed (cascade will delete associated items)
    await db
      .delete(feeds)
      .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 });
  }
}
