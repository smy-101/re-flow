import type { PipelineStep } from '@/lib/db/schema';

// API error response
interface APIError {
  error: string;
}

// Helper function to handle API responses
async function handleAPIResponse<T>(
  response: Response,
): Promise<T | APIError> {
  if (!response.ok) {
    const data = (await response.json()) as APIError;
    throw new Error(data.error || 'Request failed');
  }
  return response.json() as Promise<T>;
}

// Types
export interface Pipeline {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  steps: PipelineStep[];
  createdAt: number;
  updatedAt: number;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  steps: PipelineStep[];
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  steps?: PipelineStep[];
}

export interface GetPipelinesResponse {
  pipelines: Pipeline[];
}

// API functions

/**
 * Get all pipelines for the current user
 */
export async function getPipelines(): Promise<Pipeline[]> {
  const response = await fetch('/api/pipelines', {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await handleAPIResponse<GetPipelinesResponse>(
    response,
  )) as GetPipelinesResponse;
  return data.pipelines;
}

/**
 * Get a specific pipeline by ID
 */
export async function getPipeline(id: number): Promise<Pipeline> {
  const response = await fetch(`/api/pipelines/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  return (await handleAPIResponse<Pipeline>(response)) as Pipeline;
}

/**
 * Create a new pipeline
 */
export async function createPipeline(
  data: CreatePipelineRequest,
): Promise<Pipeline> {
  const response = await fetch('/api/pipelines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return (await handleAPIResponse<Pipeline>(response)) as Pipeline;
}

/**
 * Update an existing pipeline
 */
export async function updatePipeline(
  id: number,
  data: UpdatePipelineRequest,
): Promise<Pipeline> {
  const response = await fetch(`/api/pipelines/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return (await handleAPIResponse<Pipeline>(response)) as Pipeline;
}

/**
 * Delete a pipeline
 */
export async function deletePipeline(id: number): Promise<void> {
  const response = await fetch(`/api/pipelines/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await handleAPIResponse<void>(response);
}
