/**
 * Queue API client functions
 *
 * Provides type-safe wrapper functions for frontend to call backend queue API routes.
 */

export interface QueueItemStatus {
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

export interface OverallQueueStatus {
  pending: number;
  processing: number;
  done: number;
  error: number;
}

export interface AddToQueueInput {
  feedItemId: number;
  templateId?: number;
  pipelineId?: number;
}

export interface AddToQueueResponse {
  success: boolean;
  jobId: number;
  isNew: boolean;
}

/**
 * Get queue status for a specific feed item
 * @param feedItemId - The ID of the feed item
 * @returns The queue status or null if not in queue
 */
export async function getQueueStatus(
  feedItemId: number,
): Promise<QueueItemStatus | null> {
  const response = await fetch(`/api/queue/status?feed_item_id=${feedItemId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get queue status');
  }

  const data = await response.json();
  return data.status === null ? null : data;
}

/**
 * Get overall queue statistics for the current user
 * @returns The overall queue status counts
 */
export async function getOverallQueueStatus(): Promise<OverallQueueStatus> {
  const response = await fetch('/api/queue/status', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get queue status');
  }

  return response.json();
}

/**
 * Retry a failed job
 * @param jobId - The ID of the job to retry
 * @returns The updated job
 */
export async function retryQueueJob(
  jobId: number,
): Promise<{ success: boolean; job: QueueItemStatus }> {
  const response = await fetch('/api/queue/retry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ jobId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retry job');
  }

  return response.json();
}

/**
 * Add an item to the processing queue
 * @param input - The feed item ID and either template ID or pipeline ID
 * @returns The queue response with job ID and whether it's new
 */
export async function addToQueue(input: AddToQueueInput): Promise<AddToQueueResponse> {
  const response = await fetch('/api/queue/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '加入队列失败');
  }

  return response.json();
}
