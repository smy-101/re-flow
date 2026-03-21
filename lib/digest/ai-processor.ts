/**
 * Digest AI Processor
 *
 * Processes articles synchronously before sending a digest.
 * This ensures all articles in the digest have AI processing results.
 */

import { db } from '@/lib/db';
import {
  feedItems,
  feeds,
  craftTemplates,
  aiConfigs,
  pipelines,
  processingResults,
} from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { executePipeline, executeSingleTemplate } from '@/lib/processing/pipeline-executor';

/**
 * Result of processing a single article
 */
export interface ArticleProcessResult {
  feedItemId: number;
  title: string;
  success: boolean;
  output?: string;
  error?: string;
}

/**
 * Result of the AI processing operation
 */
export interface AIProcessResult {
  success: boolean;
  articlesProcessed: number;
  articlesSkipped: number;
  errors: string[];
  results: ArticleProcessResult[];
}

/**
 * Maximum time to spend on AI processing (10 minutes)
 */
const MAX_PROCESSING_TIME_MS = 10 * 60 * 1000;

/**
 * Get feed items that need AI processing
 *
 * Only returns items from feeds that have auto-process enabled
 * and don't already have a processing result
 */
async function getItemsNeedingProcessing(
  userId: number,
  feedItemIds: number[],
): Promise<Array<{
  item: typeof feedItems.$inferSelect;
  feed: typeof feeds.$inferSelect;
}>> {
  if (feedItemIds.length === 0) return [];

  // Get feed items with their feeds
  const items = await db.query.feedItems.findMany({
    where: and(
      inArray(feedItems.id, feedItemIds),
      eq(feedItems.userId, userId),
    ),
  });

  if (items.length === 0) return [];

  // Get feeds for these items
  const feedIds = [...new Set(items.map((item) => item.feedId))];
  const feedRecords = await db.query.feeds.findMany({
    where: inArray(feeds.id, feedIds),
  });

  const feedMap = new Map(feedRecords.map((f) => [f.id, f]));

  // Filter to only items from auto-process enabled feeds with pipeline/template
  const itemsNeedingProcessing: Array<{
    item: typeof feedItems.$inferSelect;
    feed: typeof feeds.$inferSelect;
  }> = [];

  for (const item of items) {
    const feed = feedMap.get(item.feedId);
    if (!feed) continue;

    // Only process if feed has auto-process enabled
    if (!feed.autoProcess) continue;

    // Must have either pipeline or template
    if (!feed.pipelineId && !feed.templateId) continue;

    // Check if already has a result
    const existingResult = await db.query.processingResults.findFirst({
      where: and(
        eq(processingResults.feedItemId, item.id),
        eq(processingResults.status, 'done'),
      ),
    });

    if (existingResult) {
      // Already has result, skip
      continue;
    }

    itemsNeedingProcessing.push({ item, feed });
  }

  return itemsNeedingProcessing;
}

/**
 * Process articles for a digest synchronously
 *
 * This function:
 * 1. Gets feed items that need AI processing
 * 2. Executes the AI pipeline/template for each item
 * 3. Stores results directly (bypassing the queue)
 *
 * @param userId - The user ID
 * @param feedItemIds - IDs of feed items to potentially process
 * @param maxTimeMs - Maximum time to spend processing (default 10 minutes)
 * @returns Processing result with details
 */
export async function processArticlesForDigest(
  userId: number,
  feedItemIds: number[],
  maxTimeMs: number = MAX_PROCESSING_TIME_MS,
): Promise<AIProcessResult> {
  const result: AIProcessResult = {
    success: true,
    articlesProcessed: 0,
    articlesSkipped: 0,
    errors: [],
    results: [],
  };

  const startTime = Date.now();

  try {
    // Get items that need processing
    const itemsToProcess = await getItemsNeedingProcessing(userId, feedItemIds);

    if (itemsToProcess.length === 0) {
      console.log(`No articles need AI processing for user ${userId}`);
      return result;
    }

    console.log(`Processing ${itemsToProcess.length} article(s) for user ${userId}`);

    // Process each item
    for (const { item, feed } of itemsToProcess) {
      // Check timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTimeMs) {
        console.log(`AI processing timed out after ${elapsed}ms, stopping`);
        result.errors.push('Processing timed out');
        break;
      }

      try {
        let processResult;

        if (feed.pipelineId) {
          // Execute pipeline
          const pipeline = await db.query.pipelines.findFirst({
            where: eq(pipelines.id, feed.pipelineId),
          });

          if (!pipeline) {
            throw new Error(`Pipeline ${feed.pipelineId} not found`);
          }

          // Load templates and AI configs for the pipeline
          const pipelineSteps = JSON.parse(pipeline.steps) as { templateId: number }[];
          const templateIds = pipelineSteps.map((s) => s.templateId);

          const templateRecords = await db.query.craftTemplates.findMany({
            where: inArray(craftTemplates.id, templateIds),
          });

          const aiConfigIds = templateRecords.map((t) => t.aiConfigId);
          const aiConfigRecords = await db.query.aiConfigs.findMany({
            where: inArray(aiConfigs.id, aiConfigIds),
          });

          const templatesWithConfigs = new Map(
            templateRecords.map((t) => {
              const aiConfig = aiConfigRecords.find((c) => c.id === t.aiConfigId);
              if (!aiConfig) {
                throw new Error(`AI config ${t.aiConfigId} not found for template ${t.id}`);
              }
              return [t.id, { template: t, aiConfig }];
            }),
          );

          processResult = await executePipeline(pipeline, templatesWithConfigs, item, feed);
        } else if (feed.templateId) {
          // Execute single template
          const template = await db.query.craftTemplates.findFirst({
            where: eq(craftTemplates.id, feed.templateId),
          });

          if (!template) {
            throw new Error(`Template ${feed.templateId} not found`);
          }

          const aiConfig = await db.query.aiConfigs.findFirst({
            where: eq(aiConfigs.id, template.aiConfigId),
          });

          if (!aiConfig) {
            throw new Error(`AI config ${template.aiConfigId} not found`);
          }

          processResult = await executeSingleTemplate(template, aiConfig, item, feed);
        } else {
          // Should not happen due to earlier check, but handle gracefully
          result.articlesSkipped++;
          result.results.push({
            feedItemId: item.id,
            title: item.title,
            success: true,
            output: undefined,
          });
          continue;
        }

        if (processResult.success) {
          // Store result
          await db.insert(processingResults).values({
            userId,
            feedItemId: item.id,
            pipelineId: feed.pipelineId,
            templateId: feed.templateId,
            output: processResult.output,
            stepsOutput: JSON.stringify(processResult.stepsOutput),
            status: 'done',
            tokensUsed: processResult.tokensUsed,
            completedAt: Math.floor(Date.now() / 1000),
          });

          result.articlesProcessed++;
          result.results.push({
            feedItemId: item.id,
            title: item.title,
            success: true,
            output: processResult.output,
          });
          console.log(`Article ${item.id} (${item.title}): Processed successfully`);
        } else {
          result.errors.push(`Article ${item.id}: ${processResult.error}`);
          result.results.push({
            feedItemId: item.id,
            title: item.title,
            success: false,
            error: processResult.error,
          });
          console.error(`Article ${item.id} (${item.title}): Failed - ${processResult.error}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Article ${item.id}: ${errorMessage}`);
        result.results.push({
          feedItemId: item.id,
          title: item.title,
          success: false,
          error: errorMessage,
        });
        console.error(`Article ${item.id} (${item.title}): Error - ${errorMessage}`);
      }
    }

    // Mark success as false if any article failed
    if (result.errors.length > 0 && result.articlesProcessed === 0) {
      result.success = false;
    }

    console.log(
      `AI processing complete for user ${userId}: ` +
      `${result.articlesProcessed} processed, ` +
      `${result.articlesSkipped} skipped`,
    );

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);
    result.success = false;
    console.error(`Error processing articles for user ${userId}:`, error);
    return result;
  }
}
