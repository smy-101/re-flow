import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { feeds } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { fetchAndStoreItems } from '@/lib/rss/fetcher';

// GET /api/feeds - List all feeds for current user
export async function GET() {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    // Fetch feeds with unread count
    const userFeeds = await db.query.feeds.findMany({
      where: eq(feeds.userId, userId),
      orderBy: [desc(feeds.lastUpdatedAt)],
    });

    // Calculate unread count for each feed
    const feedsWithUnread = await Promise.all(
      userFeeds.map(async (feed) => {
        // Count unread items for this feed
        const { feedItems } = await import('@/lib/db/schema');
        const { eq, and } = await import('drizzle-orm');
        const unreadItems = await db.query.feedItems.findMany({
          where: and(eq(feedItems.feedId, feed.id), eq(feedItems.isRead, false)),
        });

        return {
          ...feed,
          unreadCount: unreadItems.length,
        };
      }),
    );

    return NextResponse.json(feedsWithUnread);
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
  }
}

// POST /api/feeds - Create a new feed
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const body = await request.json();
    const { feedUrl, title, category } = body;

    if (!feedUrl || typeof feedUrl !== 'string') {
      return NextResponse.json({ error: 'feedUrl is required' }, { status: 400 });
    }

    // Check if feed already exists for this user
    const existingFeed = await db.query.feeds.findFirst({
      where: eq(feeds.feedUrl, feedUrl),
    });

    if (existingFeed && existingFeed.userId === userId) {
      return NextResponse.json({ error: '此订阅已存在' }, { status: 400 });
    }

    // Create new feed
    const [newFeed] = await db
      .insert(feeds)
      .values({
        userId,
        feedUrl,
        title: title || extractTitleFromUrl(feedUrl),
        category: category || null,
        siteUrl: extractSiteUrl(feedUrl),
        description: '新添加的订阅',
      })
      .returning();

    // Trigger background fetch (non-blocking)
    fetchAndStoreItems(newFeed.id, userId, feedUrl).catch((error) => {
      console.error('Background fetch error:', error);
    });

    return NextResponse.json(newFeed, { status: 201 });
  } catch (error) {
    console.error('Error creating feed:', error);
    return NextResponse.json({ error: 'Failed to create feed' }, { status: 500 });
  }
}

// Helper: Extract title from URL
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    return hostname.replace('www.', '');
  } catch {
    return '新订阅';
  }
}

// Helper: Extract site URL from feed URL
function extractSiteUrl(feedUrl: string): string {
  try {
    const urlObj = new URL(feedUrl);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return feedUrl;
  }
}
