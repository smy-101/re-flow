import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchAndStoreItems } from '@/lib/rss/fetcher';
import { timingSafeEqual } from 'crypto';

interface RefreshResult {
  success: boolean;
  itemsAdded: number;
  error?: string;
}

interface BatchRefreshResult {
  processed: number;
  results: Array<{
    feedId: number;
    success: boolean;
    itemsAdded: number;
    error?: string;
  }>;
}

/**
 * Safely compare two strings in constant time to prevent timing attacks.
 * Returns true if the strings match, false otherwise.
 */
function safeEqual(a: string, b: string): boolean {
  // Early return if lengths differ (this doesn't leak timing info for different lengths)
  if (a.length !== b.length) {
    return false;
  }

  // Use timingSafeEqual for constant-time comparison of same-length strings
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return timingSafeEqual(aBuffer, bBuffer);
}

// POST /api/feeds/refresh-all - Refresh all feeds (for cron/worker)
export async function POST(request: NextRequest) {
  try {
    // Check CRON_SECRET for authentication using timing-safe comparison
    const cronSecret = request.headers.get('x-cron-secret');
    const envSecret = process.env.CRON_SECRET;

    if (!cronSecret || !envSecret || !safeEqual(cronSecret, envSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all feeds
    const allFeeds = await db.query.feeds.findMany();

    if (allFeeds.length === 0) {
      return NextResponse.json({
        processed: 0,
        results: [],
      });
    }

    const results: BatchRefreshResult['results'] = [];

    // Process feeds sequentially to avoid overwhelming the server
    for (const feed of allFeeds) {
      const result: RefreshResult = await fetchAndStoreItems(
        feed.id,
        feed.userId,
        feed.feedUrl
      );

      results.push({
        feedId: feed.id,
        success: result.success,
        itemsAdded: result.itemsAdded,
        error: result.error,
      });

      // Small delay between feeds
      if (results.length < allFeeds.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Calculate totals
    const totalItemsAdded = results.reduce((sum, r) => sum + r.itemsAdded, 0);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      processed: results.length,
      totalItemsAdded,
      successCount,
      failureCount,
      results,
    });
  } catch (error) {
    console.error('Error refreshing all feeds:', error);
    return NextResponse.json({ error: 'Failed to refresh feeds' }, { status: 500 });
  }
}
