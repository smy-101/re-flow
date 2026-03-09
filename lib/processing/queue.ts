/**
 * Processing Queue Management Module
 *
 * Provides functions for managing the processing queue, including:
 * - Adding items to the queue
 * - Querying queue status
 * - Getting pending jobs for worker processing
 * - Updating job status (processing, done, error)
 * - Resetting processing jobs on worker startup
 */

import { db } from '@/lib/db';
import { processingQueue } from '@/lib/db/schema';
import { eq, and, desc, asc, not } from 'drizzle-orm';
import type { ProcessingQueue as ProcessingQueueType } from '@/lib/db/schema';

export type { ProcessingQueueType };

export interface AddToQueueInput {
  userId: number;
  feedItemId: number;
  pipelineId?: number | null;
  templateId?: number | null;
  priority?: number;
  maxAttempts?: number;
}

export interface QueueStatus {
  id: number;
  status: string;
  position: number;
  attempts: number;
  maxAttempts: number;
  errorMessage: string | null;
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;
}

/**
 * Add an item to the processing queue
 * If a non-done job already exists for the same feed item, returns existing job
 */
export async function addToQueue(input: AddToQueueInput): Promise<ProcessingQueueType> {
  const { userId, feedItemId, pipelineId = null, templateId = null, priority = 0, maxAttempts = 3 } = input;

  // Check if there's an existing non-done/non-error job for this feed item
  const existingJob = await db.query.processingQueue.findFirst({
    where: and(
      eq(processingQueue.feedItemId, feedItemId),
      not(eq(processingQueue.status, 'done')),
      not(eq(processingQueue.status, 'error'))
    ),
  });

  // Double-check status for safety (in case mock doesn't filter properly)
  if (existingJob && existingJob.status !== 'done' && existingJob.status !== 'error') {
    return existingJob;
  }

  // Create new queue job
  const [job] = await db
    .insert(processingQueue)
    .values({
      userId,
      feedItemId,
      pipelineId,
      templateId,
      status: 'pending',
      priority,
      attempts: 0,
      maxAttempts,
      errorMessage: null,
      createdAt: Math.floor(Date.now() / 1000),
      startedAt: null,
      completedAt: null,
    })
    .returning();

  return job;
}

/**
 * Get queue status for a specific feed item
 * Returns null if no job exists for the feed item
 */
export async function getQueueStatus(
  userId: number,
  feedItemId: number,
): Promise<QueueStatus | null> {
  const job = await db.query.processingQueue.findFirst({
    where: and(
      eq(processingQueue.userId, userId),
      eq(processingQueue.feedItemId, feedItemId),
    ),
    orderBy: [desc(processingQueue.createdAt)],
  });

  if (!job) {
    return null;
  }

  // Calculate position in queue for pending jobs
  let position = 0;
  if (job.status === 'pending') {
    const pendingJobs = await db.query.processingQueue.findMany({
      where: eq(processingQueue.status, 'pending'),
      orderBy: [desc(processingQueue.priority), asc(processingQueue.createdAt)],
    });
    const jobIndex = pendingJobs.findIndex((j) => j.id === job.id);
    position = jobIndex >= 0 ? jobIndex + 1 : 0;
  }

  return {
    id: job.id,
    status: job.status,
    position,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  };
}

/**
 * Get the next pending job from the queue
 * Ordered by priority DESC, createdAt ASC
 */
export async function getNextPendingJob(): Promise<ProcessingQueueType | null> {
  const job = await db.query.processingQueue.findFirst({
    where: eq(processingQueue.status, 'pending'),
    orderBy: [desc(processingQueue.priority), asc(processingQueue.createdAt)],
  });

  return job ?? null;
}

/**
 * Mark a job as processing
 */
export async function markJobProcessing(jobId: number): Promise<ProcessingQueueType> {
  const [job] = await db
    .update(processingQueue)
    .set({
      status: 'processing',
      startedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(processingQueue.id, jobId))
    .returning();

  return job;
}

/**
 * Mark a job as done
 */
export async function markJobDone(jobId: number): Promise<ProcessingQueueType> {
  const [job] = await db
    .update(processingQueue)
    .set({
      status: 'done',
      completedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(processingQueue.id, jobId))
    .returning();

  return job;
}

/**
 * Mark a job as error or retry
 * If attempts < maxAttempts, sets status back to pending for retry
 * Otherwise, sets status to error
 */
export async function markJobError(
  jobId: number,
  errorMessage: string,
  currentAttempts?: number,
  maxAttempts?: number,
): Promise<ProcessingQueueType> {
  // Get current job state if attempts not provided
  let attempts = currentAttempts;
  let max = maxAttempts;

  if (attempts === undefined || max === undefined) {
    const job = await db.query.processingQueue.findFirst({
      where: eq(processingQueue.id, jobId),
    });
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    attempts = attempts ?? job.attempts;
    max = max ?? job.maxAttempts;
  }

  const newAttempts = attempts + 1;
  const isMaxReached = newAttempts >= max;

  const [job] = await db
    .update(processingQueue)
    .set({
      status: isMaxReached ? 'error' : 'pending',
      attempts: newAttempts,
      errorMessage,
    })
    .where(eq(processingQueue.id, jobId))
    .returning();

  return job;
}

/**
 * Reset all processing jobs to pending status
 * Called on worker startup to recover from crashes
 */
export async function resetProcessingJobs(): Promise<void> {
  await db
    .update(processingQueue)
    .set({
      status: 'pending',
      startedAt: null,
    })
    .where(eq(processingQueue.status, 'processing'));
}

/**
 * Retry a failed job
 * Resets the job to pending status and clears the error message
 * Returns the updated job or null if not found or not in error state
 */
export async function retryJob(
  userId: number,
  jobId: number,
): Promise<ProcessingQueueType | null> {
  const job = await db.query.processingQueue.findFirst({
    where: and(
      eq(processingQueue.id, jobId),
      eq(processingQueue.userId, userId),
      eq(processingQueue.status, 'error'),
    ),
  });

  if (!job) {
    return null;
  }

  const [updatedJob] = await db
    .update(processingQueue)
    .set({
      status: 'pending',
      attempts: 0,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
    })
    .where(eq(processingQueue.id, jobId))
    .returning();

  return updatedJob;
}
