import type { StepOutput } from '@/lib/db/schema';

// Processing result type for frontend
export interface ProcessingResult {
  id: number;
  userId: number;
  feedItemId: number;
  pipelineId: number | null;
  templateId: number | null;
  output: string | null;
  stepsOutput: StepOutput[] | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage: string | null;
  tokensUsed: number | null;
  createdAt: number;
  completedAt: number | null;
  templateName: string | null;
  pipelineName: string | null;
}

// Process request types
export interface ProcessWithTemplateRequest {
  feedItemId: number;
  templateId: number;
}

export interface ProcessWithPipelineRequest {
  feedItemId: number;
  pipelineId: number;
}

export type ProcessRequest = ProcessWithTemplateRequest | ProcessWithPipelineRequest;

/**
 * Process an article with a template or pipeline
 */
export async function processArticle(
  request: ProcessRequest,
): Promise<ProcessingResult> {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? '处理失败');
  }

  return (await response.json()) as ProcessingResult;
}

/**
 * Get all processing results for the current user
 */
export async function getProcessingResults(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ProcessingResult[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());

  const url = `/api/processing-results${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? 'Request failed');
  }

  const data = (await response.json()) as { results: ProcessingResult[] };
  return data.results;
}

/**
 * Get a single processing result by ID
 */
export async function getProcessingResult(id: number): Promise<ProcessingResult> {
  const response = await fetch(`/api/processing-results/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? 'Request failed');
  }

  return (await response.json()) as ProcessingResult;
}

/**
 * Get processing history for a feed item
 */
export async function getFeedItemProcessingHistory(
  feedItemId: number,
): Promise<ProcessingResult[]> {
  const response = await fetch(
    `/api/feed-items/${feedItemId}/processing-results`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    const data = (await response.json()) as { error?: string };
    throw new Error(data.error ?? 'Request failed');
  }

  const data = (await response.json()) as { results: ProcessingResult[] };
  return data.results;
}
