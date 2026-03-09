import Parser, { Item } from 'rss-parser';
import { db } from '@/lib/db';
import { feedItems, feeds } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { addToQueue } from '@/lib/processing/queue';

// Extend Item type to include custom fields
type CustomItem = Item & {
  'content:encoded'?: string;
  description?: string;
};

// Types
export interface ParsedFeedItem {
  title: string;
  link: string;
  content: string;
  publishedAt: number;
  author?: string;
}

export interface FetchResult {
  success: boolean;
  itemsAdded: number;
  error?: string;
}

// Parse RSS feed from URL with 10 second timeout
export async function parseRSS(feedUrl: string): Promise<{
  items: ParsedFeedItem[];
  title?: string;
}> {
  const parser = new Parser({
    timeout: 10000, // 10 second timeout
    customFields: {
      feed: ['image', 'language', 'updated'],
      item: ['author', 'category', 'content:encoded'],
    },
  });

  try {
    const feed = await parser.parseURL(feedUrl);

    if (!feed) {
      throw new Error('Failed to parse RSS feed');
    }

    const parsedItems: ParsedFeedItem[] = (feed.items || [])
      .filter((item) => item.link !== undefined) // Only items with a link
      .map((item) => {
        const customItem = item as CustomItem;
        // Use content:encoded or content or snippet from description
        const content =
          customItem['content:encoded'] ||
          item.content ||
          item.contentSnippet ||
          customItem.description ||
          '';

        // Parse published date
        let publishedAt = Date.now();
        if (item.pubDate) {
          publishedAt = new Date(item.pubDate).getTime();
        } else if (item.isoDate) {
          publishedAt = new Date(item.isoDate).getTime();
        }

        return {
          title: item.title || 'Untitled',
          link: item.link!,
          content,
          publishedAt: Math.floor(publishedAt / 1000), // Convert to Unix timestamp
          author: item.author || item.creator || undefined,
        };
      });

    return {
      items: parsedItems,
      title: feed.title || undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        throw new Error('RSS feed request timed out');
      }
      throw error;
    }
    throw new Error('Failed to fetch RSS feed');
  }
}

// Deduplicate items based on link field
export async function dedupeItems(
  items: ParsedFeedItem[],
  feedId: number
): Promise<ParsedFeedItem[]> {
  if (items.length === 0) return [];

  // Get existing links for this feed
  const existingItems = await db.query.feedItems.findMany({
    where: eq(feedItems.feedId, feedId),
    columns: { link: true },
  });

  const existingLinks = new Set(existingItems.map((item) => item.link));

  // Filter out items that already exist
  return items.filter((item) => !existingLinks.has(item.link));
}

// Calculate reading time (250 words per minute)
export function calculateReadingTime(content: string): number {
  // Strip HTML tags and count words
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(' ').filter((word) => word.length > 0).length;

  // 250 words per minute
  const minutes = Math.ceil(wordCount / 250);
  return minutes > 0 ? minutes : 1;
}

// Store items in database with transaction
export async function storeItems(
  feedId: number,
  userId: number,
  items: ParsedFeedItem[]
): Promise<number> {
  if (items.length === 0) return 0;

  try {
    // Get feed for category info and auto-process settings
    const feed = await db.query.feeds.findFirst({
      where: eq(feeds.id, feedId),
    });

    if (!feed) {
      throw new Error('Feed not found');
    }

    // Prepare items with reading time
    const itemsToInsert = items.map((item) => ({
      feedId,
      userId,
      title: item.title,
      link: item.link,
      content: item.content,
      publishedAt: item.publishedAt,
      author: item.author || null,
      readingTime: calculateReadingTime(item.content),
    }));

    // Insert items (duplicates are already filtered by dedupeItems)
    const insertedItems = await db.insert(feedItems).values(itemsToInsert).returning();

    // Auto-enqueue items if feed has auto-process enabled
    if (feed.autoProcess && (feed.pipelineId || feed.templateId)) {
      for (const insertedItem of insertedItems) {
        try {
          await addToQueue({
            userId,
            feedItemId: insertedItem.id,
            pipelineId: feed.pipelineId,
            templateId: feed.templateId,
          });
        } catch (error) {
          // Log error but don't fail the storage operation
          console.error('Failed to auto-enqueue item:', insertedItem.id, error);
        }
      }
    }

    return itemsToInsert.length;
  } catch (error) {
    console.error('Error storing items:', error);
    throw new Error('Failed to store items');
  }
}

// Main function: Fetch and store items for a feed
export async function fetchAndStoreItems(
  feedId: number,
  userId: number,
  feedUrl: string
): Promise<FetchResult> {
  try {
    // Parse RSS feed
    const { items } = await parseRSS(feedUrl);

    if (items.length === 0) {
      return {
        success: true,
        itemsAdded: 0,
      };
    }

    // Deduplicate items
    const newItems = await dedupeItems(items, feedId);

    if (newItems.length === 0) {
      return {
        success: true,
        itemsAdded: 0,
      };
    }

    // Store items
    const itemsAdded = await storeItems(feedId, userId, newItems);

    // Update feed's lastUpdated timestamp
    await db
      .update(feeds)
      .set({
        lastUpdatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(feeds.id, feedId));

    return {
      success: true,
      itemsAdded,
    };
  } catch (error) {
    console.error('Error fetching and storing items:', error);
    return {
      success: false,
      itemsAdded: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch RSS feed',
    };
  }
}
