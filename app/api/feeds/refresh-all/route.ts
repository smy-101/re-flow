import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchAndStoreItems } from '@/lib/rss/fetcher';

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

// POST /api/feeds/refresh-all - Refresh all feeds (for cron/worker)
export async function POST(request: NextRequest) {
  try {
    // Check CRON_SECRET for authentication
    const cronSecret = request.headers.get('x-cron-secret');
    const envSecret = process.env.CRON_SECRET;

    if (!cronSecret || cronSecret !== envSecret) {
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
