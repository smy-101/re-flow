/**
 * Processing Worker
 *
 * Background worker process that consumes processing queue jobs and executes AI processing.
 */

import './load-env';

import { db } from '@/lib/db';
import { processingQueue, craftTemplates, aiConfigs, feedItems, feeds, pipelines, processingResults } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import {
  getNextPendingJob,
  markJobProcessing,
  markJobDone,
  markJobError,
  resetProcessingJobs,
} from '@/lib/processing/queue';
import { executePipeline, executeSingleTemplate } from '@/lib/processing/pipeline-executor';

// Polling interval (10 seconds)/
const POLL_INTERVAL_MS = 10 * 1000;

// Task timeout (60 seconds)
const TASK_TIMEOUT_MS = 60 * 1000;

// Track current job for graceful shutdown
let currentJobId: number | null = null;
let isShuttingDown = false;

/**
 * Process a single job from the queue
 */
async function processJob(job: typeof processingQueue.$inferSelect): Promise<void> {
  const startTime = Date.now();
  currentJobId = job.id;

  console.log(`Processing job ${job.id} (feedItemId: ${job.feedItemId})`);

  try {
    // Mark as processing
    await markJobProcessing(job.id);

    // Load feed item
    const feedItem = await db.query.feedItems.findFirst({
      where: eq(feedItems.id, job.feedItemId),
    });

    if (!feedItem) {
      throw new Error(`Feed item ${job.feedItemId} not found`);
    }

    // Load feed
    const feed = await db.query.feeds.findFirst({
      where: eq(feeds.id, feedItem.feedId),
    });

    if (!feed) {
      throw new Error(`Feed ${feedItem.feedId} not found`);
    }

    let result;

    // Execute pipeline or template
    if (job.pipelineId) {
      // Load pipeline
      const pipeline = await db.query.pipelines.findFirst({
        where: eq(pipelines.id, job.pipelineId),
      });

      if (!pipeline) {
        throw new Error(`Pipeline ${job.pipelineId} not found`);
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

      result = await executePipeline(pipeline, templatesWithConfigs, feedItem, feed);
    } else if (job.templateId) {
      // Load template
      const template = await db.query.craftTemplates.findFirst({
        where: eq(craftTemplates.id, job.templateId),
      });

      if (!template) {
        throw new Error(`Template ${job.templateId} not found`);
      }

      // Load AI config
      const aiConfig = await db.query.aiConfigs.findFirst({
        where: eq(aiConfigs.id, template.aiConfigId),
      });

      if (!aiConfig) {
        throw new Error(`AI config ${template.aiConfigId} not found`);
      }

      result = await executeSingleTemplate(template, aiConfig, feedItem, feed);
    } else {
      throw new Error('Job has no pipelineId or templateId');
    }

    // Check for timeout
    const elapsed = Date.now() - startTime;
    if (elapsed > TASK_TIMEOUT_MS) {
      throw new Error(`Task timed out after ${elapsed}ms`);
    }

    // Check if execution was successful
    if (!result.success) {
      throw new Error(result.error || 'Processing failed');
    }

    // Store result in processing_results table
    await db.insert(processingResults).values({
      userId: job.userId,
      feedItemId: job.feedItemId,
      pipelineId: job.pipelineId,
      templateId: job.templateId,
      output: result.output,
      stepsOutput: JSON.stringify(result.stepsOutput),
      status: 'done',
      tokensUsed: result.tokensUsed,
      completedAt: Math.floor(Date.now() / 1000),
    });

    // Mark as done
    await markJobDone(job.id);
    console.log(`Job ${job.id} completed successfully in ${elapsed}ms`);
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isDecryptAuthError =
      errorMessage.includes('Unsupported state or unable to authenticate data');

    // Decrypt/auth failures are not transient; fail fast with actionable guidance.
    const attemptsForUpdate = isDecryptAuthError
      ? Math.max(job.maxAttempts - 1, 0)
      : job.attempts;

    const updatedJob = await markJobError(
      job.id,
      isDecryptAuthError
        ? 'Failed to decrypt AI API key. Ensure worker and app use the same ENCRYPTION_KEY (check .env.local/.env).'
        : errorMessage,
      attemptsForUpdate,
      job.maxAttempts,
    );

    if (updatedJob.status === 'error') {
      console.error(`Job ${job.id} failed permanently after ${updatedJob.attempts} attempts`);
    } else {
      console.log(`Job ${job.id} will be retried (attempt ${updatedJob.attempts}/${job.maxAttempts})`);
    }
  } finally {
    currentJobId = null;
  }
}

/**
 * Poll the queue for pending jobs
 */
async function pollQueue(): Promise<void> {
  if (isShuttingDown) return;

  try {
    const job = await getNextPendingJob();

    if (job) {
      await processJob(job);
    }
  } catch (error) {
    console.error('Error polling queue:', error);
  }
}

/**
 * Start the processing worker
 */
async function startWorker(): Promise<void> {
  console.log('Starting Processing Worker...');
  console.log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s`);

  // Reset any processing jobs from previous crash
  console.log('Resetting processing jobs from previous run...');
  await resetProcessingJobs();

  // Start polling loop
  console.log('Worker started. Press Ctrl+C to stop.\n');

  while (!isShuttingDown) {
    await pollQueue();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

/**
 * Handle graceful shutdown
 */
async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;

  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  isShuttingDown = true;

  // Wait for current job to complete (max 30 seconds)
  if (currentJobId) {
    console.log(`Waiting for current job ${currentJobId} to complete...`);
    const startTime = Date.now();
    const maxWaitMs = 30 * 1000;

    while (currentJobId && Date.now() - startTime < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (currentJobId) {
      console.log(`Job ${currentJobId} did not complete in time, will be reset on next startup`);
    }
  }

  console.log('Processing Worker stopped.');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start the worker
startWorker().catch((error) => {
  console.error('Failed to start processing worker:', error);
  process.exit(1);
});
