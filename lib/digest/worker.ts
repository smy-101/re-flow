import cron from 'node-cron';
import { eq, and, lte } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  users,
  feeds,
  feedItems,
  emailDigestConfigs,
  emailDigestFilters,
  emailDigestLogs,
  processingResults,
} from '@/lib/db/schema';
import {
  calculateNextSendAt,
} from './scheduler';
import {
  buildDigestContent,
  type DigestItem,
} from './content-builder';
import {
  sendDigestEmail,
  updateConfigAfterSend,
} from './sender';

/**
 * Interval between processing users (ms)
 */
const USER_PROCESS_INTERVAL_MS = 500;

/**
 * Get the app base URL from environment
 */
function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Get unsubscribe URL for a user
 */
function getUnsubscribeUrl(userId: number): string {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/settings/digest?userId=${userId}`;
}

/**
 * Query unread items for a user within the time window
 */
async function queryUnreadItems(
  userId: number,
  _frequency: 'daily' | 'weekly' | 'custom',
  _customDays: number | null,
): Promise<DigestItem[]> {
  // Note: Time window filtering not applied - all unread items are included
  // Future enhancement: filter by publishedAt within window

  // Query unread feed items with feed info
  const items = await db
    .select({
      id: feedItems.id,
      title: feedItems.title,
      link: feedItems.link,
      publishedAt: feedItems.publishedAt,
      readingTime: feedItems.readingTime,
      feedTitle: feeds.title,
      feedCategory: feeds.category,
      feedAutoProcess: feeds.autoProcess,
    })
    .from(feedItems)
    .innerJoin(feeds, eq(feedItems.feedId, feeds.id))
    .where(
      and(
        eq(feedItems.userId, userId),
        eq(feedItems.isRead, false),
      ),
    );

  // For each item, check if there's a processing result
  const itemsWithAi: DigestItem[] = [];
  for (const item of items) {
    let aiOutput: string | null = null;

    if (item.feedAutoProcess) {
      const result = await db.query.processingResults.findFirst({
        where: and(
          eq(processingResults.feedItemId, item.id),
          eq(processingResults.status, 'done'),
        ),
      });
      aiOutput = result?.output ?? null;
    }

    itemsWithAi.push({
      id: item.id,
      title: item.title,
      link: item.link,
      feedTitle: item.feedTitle,
      feedCategory: item.feedCategory,
      publishedAt: item.publishedAt,
      readingTime: item.readingTime,
      aiProcessed: aiOutput !== null,
      aiOutput,
    });
  }

  return itemsWithAi;
}

/**
 * Apply filters to items
 */
async function applyFilters(
  items: DigestItem[],
  configId: number,
): Promise<DigestItem[]> {
  const filters = await db.query.emailDigestFilters.findMany({
    where: eq(emailDigestFilters.configId, configId),
  });

  if (filters.length === 0) {
    return items;
  }

  const filter = filters[0];

  switch (filter.filterType) {
    case 'all':
      return items;
    case 'category':
      return items.filter((item) => item.feedCategory === filter.filterValue);
    case 'feed':
      return items;
    default:
      return items;
  }
}

/**
 * Process a single digest config
 */
async function processDigestConfig(config: typeof emailDigestConfigs.$inferSelect): Promise<{
  success: boolean;
  itemCount: number;
  error?: string;
}> {
  const { userId, id: configId, frequency, customDays, timezone, markAsRead, sendTime } = config;

  // Cast frequency to correct type
  const typedFrequency = frequency as 'daily' | 'weekly' | 'custom';

  try {
    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.emailVerified) {
      return { success: false, itemCount: 0, error: 'User email not verified' };
    }

    // Query unread items
    let items = await queryUnreadItems(userId, typedFrequency, customDays);

    // Apply filters
    items = await applyFilters(items, configId);

    // Calculate next send time (regardless of whether we send)
    const nextSendAt = calculateNextSendAt({
      frequency: typedFrequency,
      customDays,
      sendTime,
      timezone,
    });

    if (items.length === 0) {
      // No items to send, just update nextSendAt
      await db
        .update(emailDigestConfigs)
        .set({ nextSendAt })
        .where(eq(emailDigestConfigs.id, configId));

      return { success: true, itemCount: 0 };
    }

    // Build email content
    const emailContent = buildDigestContent({
      items,
      timezone,
      frequency: typedFrequency,
      unsubscribeUrl: getUnsubscribeUrl(userId),
      appBaseUrl: getAppBaseUrl(),
    });

    if (!emailContent.hasContent) {
      await db
        .update(emailDigestConfigs)
        .set({ nextSendAt })
        .where(eq(emailDigestConfigs.id, configId));

      return { success: true, itemCount: 0 };
    }

    // Send email
    const result = await sendDigestEmail({
      to: user.email,
      subject: `📰 Re:Flow Digest: ${items.length} article${items.length !== 1 ? 's' : ''}`,
      htmlContent: emailContent.htmlContent,
      userId,
      configId,
      itemCount: items.length,
    });

    // Update config state
    const updateResult = updateConfigAfterSend({
      success: result.success,
      configId,
      itemCount: items.length,
      currentFailureCount: config.consecutiveFailures,
      error: result.error,
    });

    // Update config in database
    await db
      .update(emailDigestConfigs)
      .set({
        lastSentAt: updateResult.lastSentAt ?? config.lastSentAt,
        nextSendAt,
        consecutiveFailures: updateResult.consecutiveFailures,
        pausedDueToFailures: updateResult.pausedDueToFailures,
      })
      .where(eq(emailDigestConfigs.id, configId));

    // Log the send
    await db.insert(emailDigestLogs).values({
      configId,
      userId,
      success: result.success,
      itemCount: items.length,
      errorMessage: result.error,
    });

    // Mark items as read if configured
    if (result.success && markAsRead) {
      for (const item of items) {
        await db
          .update(feedItems)
          .set({ isRead: true })
          .where(eq(feedItems.id, item.id));
      }
    }

    return { success: result.success, itemCount: items.length, error: result.error };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, itemCount: 0, error: errorMessage };
  }
}

/**
 * Check and process due digests
 */
async function processDueDigests(): Promise<void> {
  console.log('Checking for due digests...');

  try {
    const now = Math.floor(Date.now() / 1000);

    // Get all configs that are due for sending
    const dueConfigs = await db.query.emailDigestConfigs.findMany({
      where: and(
        eq(emailDigestConfigs.enabled, true),
        eq(emailDigestConfigs.pausedDueToFailures, false),
        lte(emailDigestConfigs.nextSendAt, now),
      ),
    });

    if (dueConfigs.length === 0) {
      console.log('No digests due for sending.');
      return;
    }

    console.log(`Found ${dueConfigs.length} digest(s) to process.`);

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      totalItemsSent: 0,
    };

    // Process each config sequentially
    for (const config of dueConfigs) {
      console.log(`Processing digest config ${config.id} for user ${config.userId}...`);

      const result = await processDigestConfig(config);

      if (result.success) {
        if (result.itemCount > 0) {
          results.success++;
          results.totalItemsSent += result.itemCount;
          console.log(`  ✓ Sent ${result.itemCount} items`);
        } else {
          results.skipped++;
          console.log(`  - No items to send`);
        }
      } else {
        results.failed++;
        console.error(`  ✗ Failed: ${result.error}`);
      }

      results.processed++;

      // Delay between users
      if (results.processed < dueConfigs.length) {
        await new Promise((resolve) => setTimeout(resolve, USER_PROCESS_INTERVAL_MS));
      }
    }

    // Print summary
    console.log('\n=== Digest Worker Batch Complete ===');
    console.log(`Total configs: ${results.processed}`);
    console.log(`Sent: ${results.success}`);
    console.log(`Skipped (no items): ${results.skipped}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total items sent: ${results.totalItemsSent}`);
    console.log('=====================================\n');
  } catch (error) {
    console.error('Error in processDueDigests:', error);
  }
}

/**
 * Start the digest worker
 */
async function startWorker(): Promise<void> {
  console.log('Starting Digest Worker...');
  console.log('Cron schedule: */5 * * * * (every 5 minutes)\n');

  // Run immediately on startup
  console.log('Running initial check on startup...');
  await processDueDigests();

  // Schedule cron job - run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('\n=== Cron Job Triggered ===');
    console.log(`Time: ${new Date().toISOString()}`);
    await processDueDigests();
  });

  // Keep the process running
  console.log('Worker is running. Press Ctrl+C to stop.\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Digest Worker...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Digest Worker...');
  process.exit(0);
});

// Start the worker
startWorker().catch((error) => {
  console.error('Failed to start digest worker:', error);
  process.exit(1);
});
