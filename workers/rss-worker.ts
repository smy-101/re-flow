import cron from 'node-cron';
import { config } from 'dotenv';
config({ path: '.env', override: true });
config({ path: '.env.local', override: true });
config({ path: '.env.development', override: true });
config({ path: '.env.development.local', override: true });

import { db } from '@/lib/db';
import { fetchAndStoreItems } from '@/lib/rss/fetcher';

// Minimum interval between refreshes (5 minutes)
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Process a single feed with minimum interval check
 */
async function processSingleFeed(feed: {
  id: number;
  userId: number;
  feedUrl: string;
  lastUpdatedAt: number;
}): Promise<{ success: boolean; itemsAdded: number; skipped: boolean; error?: string }> {
  const now = Date.now();
  const lastUpdatedMs = feed.lastUpdatedAt * 1000;
  const timeSinceLastUpdate = now - lastUpdatedMs;

  // Skip if refreshed within the last 5 minutes
  if (timeSinceLastUpdate < MIN_REFRESH_INTERVAL_MS) {
    return {
      success: true,
      itemsAdded: 0,
      skipped: true,
    };
  }

  try {
    const result = await fetchAndStoreItems(feed.id, feed.userId, feed.feedUrl);
    return {
      success: result.success,
      itemsAdded: result.itemsAdded || 0,
      skipped: false,
      error: result.error,
    };
  } catch (error) {
    console.error(`Error processing feed ${feed.id}:`, error);
    return {
      success: false,
      itemsAdded: 0,
      skipped: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Refresh all feeds sequentially
 */
async function refreshAllFeeds(): Promise<void> {
  console.log('Starting RSS feed refresh batch...');

  try {
    // Get all feeds
    const allFeeds = await db.query.feeds.findMany();

    if (allFeeds.length === 0) {
      console.log('No feeds to process.');
      return;
    }

    console.log(`Found ${allFeeds.length} feed(s) to process.`);

    const results = {
      processed: 0,
      skipped: 0,
      success: 0,
      failed: 0,
      totalItemsAdded: 0,
    };

    // Process feeds sequentially
    for (const feed of allFeeds) {
      const result = await processSingleFeed(feed);

      if (result.skipped) {
        results.skipped++;
        console.log(`Feed ${feed.id} (${feed.title}): Skipped (recently updated)`);
      } else if (result.success) {
        results.success++;
        results.totalItemsAdded += result.itemsAdded;
        console.log(
          `Feed ${feed.id} (${feed.title}): Success (${result.itemsAdded} items added)`
        );
      } else {
        results.failed++;
        console.error(
          `Feed ${feed.id} (${feed.title}): Failed${result.error ? ` - ${result.error}` : ''}`
        );
      }

      results.processed++;

      // Small delay between feeds (500ms)
      if (results.processed < allFeeds.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Print summary
    console.log('\n=== RSS Worker Batch Complete ===');
    console.log(`Total feeds: ${results.processed}`);
    console.log(`Skipped (recent): ${results.skipped}`);
    console.log(`Successful: ${results.success}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total items added: ${results.totalItemsAdded}`);
    console.log('================================\n');
  } catch (error) {
    console.error('Error in refreshAllFeeds:', error);
  }
}

/**
 * Start the RSS worker
 */
async function startWorker(): Promise<void> {
  console.log('Starting RSS Worker...');
  console.log('Cron schedule: */30 * * * * (every 30 minutes)\n');

  // Run immediately on startup
  console.log('Running initial fetch on startup...');
  await refreshAllFeeds();

  // Schedule cron job - run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('\n=== Cron Job Triggered ===');
    console.log(`Time: ${new Date().toISOString()}`);
    await refreshAllFeeds();
  });

  // Keep the process running
  console.log('Worker is running. Press Ctrl+C to stop.\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down RSS Worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down RSS Worker...');
  process.exit(0);
});

// Start the worker
startWorker().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});
