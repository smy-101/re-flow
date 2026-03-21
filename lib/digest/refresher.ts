/**
 * Digest RSS Refresher
 *
 * Refreshes RSS feeds based on email digest filter rules.
 * This module is called before sending a digest to ensure fresh content.
 */

import { db } from '@/lib/db';
import { feeds, emailDigestFilters } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { fetchAndStoreItems } from '@/lib/rss/fetcher';

/**
 * Filter types for digest configuration
 */
export type FilterType = 'all' | 'category' | 'feed';

/**
 * Result of refreshing a single feed
 */
export interface FeedRefreshResult {
  feedId: number;
  feedTitle: string;
  success: boolean;
  itemsAdded: number;
  error?: string;
  skipped?: boolean;
}

/**
 * Result of the refresh operation
 */
export interface RefreshResult {
  success: boolean;
  feedsProcessed: number;
  feedsSkipped: number;
  totalItemsAdded: number;
  errors: string[];
  feedResults: FeedRefreshResult[];
}

/**
 * Minimum interval between refreshes (5 minutes)
 */
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Get feed IDs based on digest filter configuration
 */
async function getFeedIdsForFilter(
  userId: number,
  configId: number,
): Promise<{ feedIds: number[]; filterType: FilterType }> {
  // Get the filter for this config
  const filters = await db.query.emailDigestFilters.findMany({
    where: eq(emailDigestFilters.configId, configId),
  });

  // Default to 'all' if no filter
  const filter = filters[0];
  const filterType = (filter?.filterType as FilterType) || 'all';
  const filterValue = filter?.filterValue;

  // Query feeds based on filter type
  if (filterType === 'all') {
    // All feeds for user
    const userFeeds = await db.query.feeds.findMany({
      where: eq(feeds.userId, userId),
      columns: { id: true },
    });
    return {
      feedIds: userFeeds.map((f) => f.id),
      filterType,
    };
  } else if (filterType === 'category' && filterValue) {
    // Feeds in specific category
    const categoryFeeds = await db.query.feeds.findMany({
      where: and(
        eq(feeds.userId, userId),
        eq(feeds.category, filterValue),
      ),
      columns: { id: true },
    });
    return {
      feedIds: categoryFeeds.map((f) => f.id),
      filterType,
    };
  } else if (filterType === 'feed' && filterValue) {
    // Specific feed - filterValue is the feed ID
    const feedId = parseInt(filterValue, 10);
    if (isNaN(feedId)) {
      // Invalid feed ID, return empty
      return { feedIds: [], filterType };
    }
    return {
      feedIds: [feedId],
      filterType,
    };
  }

  // Fallback to all feeds
  const userFeeds = await db.query.feeds.findMany({
    where: eq(feeds.userId, userId),
    columns: { id: true },
  });
  return {
    feedIds: userFeeds.map((f) => f.id),
    filterType,
  };
}

/**
 * Refresh feeds for a digest configuration
 *
 * This function:
 * 1. Determines which feeds to refresh based on the digest filter
 * 2. Skips feeds that were recently updated (within 5 minutes)
 * 3. Fetches and stores new items from each feed
 *
 * @param userId - The user ID
 * @param configId - The digest config ID
 * @returns Refresh result with details of each feed refresh
 */
export async function refreshFeedsForDigest(
  userId: number,
  configId: number,
): Promise<RefreshResult> {
  const result: RefreshResult = {
    success: true,
    feedsProcessed: 0,
    feedsSkipped: 0,
    totalItemsAdded: 0,
    errors: [],
    feedResults: [],
  };

  try {
    // Get feed IDs based on filter
    const { feedIds, filterType } = await getFeedIdsForFilter(userId, configId);

    if (feedIds.length === 0) {
      console.log(`No feeds to refresh for config ${configId} (filter: ${filterType})`);
      return result;
    }

    console.log(`Refreshing ${feedIds.length} feed(s) for config ${configId} (filter: ${filterType})`);

    // Get full feed data
    const feedsToRefresh = await db.query.feeds.findMany({
      where: inArray(feeds.id, feedIds),
    });

    const now = Date.now();

    // Process each feed
    for (const feed of feedsToRefresh) {
      const lastUpdatedMs = (feed.lastUpdatedAt ?? 0) * 1000;
      const timeSinceLastUpdate = now - lastUpdatedMs;

      // Skip if refreshed within the last 5 minutes
      if (timeSinceLastUpdate < MIN_REFRESH_INTERVAL_MS) {
        result.feedsSkipped++;
        result.feedResults.push({
          feedId: feed.id,
          feedTitle: feed.title,
          success: true,
          itemsAdded: 0,
          skipped: true,
        });
        console.log(`Feed ${feed.id} (${feed.title}): Skipped (recently updated)`);
        continue;
      }

      // Fetch and store items
      try {
        const fetchResult = await fetchAndStoreItems(feed.id, feed.userId, feed.feedUrl);

        result.feedsProcessed++;
        result.totalItemsAdded += fetchResult.itemsAdded;

        if (fetchResult.success) {
          result.feedResults.push({
            feedId: feed.id,
            feedTitle: feed.title,
            success: true,
            itemsAdded: fetchResult.itemsAdded,
          });
          console.log(`Feed ${feed.id} (${feed.title}): Success (${fetchResult.itemsAdded} items added)`);
        } else {
          result.errors.push(`Feed ${feed.id}: ${fetchResult.error}`);
          result.feedResults.push({
            feedId: feed.id,
            feedTitle: feed.title,
            success: false,
            itemsAdded: 0,
            error: fetchResult.error,
          });
          console.error(`Feed ${feed.id} (${feed.title}): Failed - ${fetchResult.error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Feed ${feed.id}: ${errorMessage}`);
        result.feedsProcessed++;
        result.feedResults.push({
          feedId: feed.id,
          feedTitle: feed.title,
          success: false,
          itemsAdded: 0,
          error: errorMessage,
        });
        console.error(`Feed ${feed.id} (${feed.title}): Error - ${errorMessage}`);
      }

      // Small delay between feeds (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Mark success as false if any feed failed
    if (result.errors.length > 0) {
      result.success = result.feedsProcessed > 0;
    }

    console.log(
      `Refresh complete for config ${configId}: ` +
      `${result.feedsProcessed} processed, ` +
      `${result.feedsSkipped} skipped, ` +
      `${result.totalItemsAdded} items added`,
    );

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    result.success = false;
    console.error(`Error refreshing feeds for config ${configId}:`, error);
    return result;
  }
}
