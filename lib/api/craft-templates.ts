// API error response
interface APIError {
  error: string;
  templates?: Array<{ id: number; name: string }>;
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
export interface CraftTemplate {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  aiConfigId: number;
  aiConfigName: string | null;
  promptTemplate: string;
  category: 'summarize' | 'translate' | 'filter' | 'analyze' | 'rewrite' | 'custom';
  createdAt: number;
  updatedAt: number;
}

export interface CreateCraftTemplateRequest {
  name: string;
  description?: string;
  aiConfigId: number;
  promptTemplate: string;
  category?: 'summarize' | 'translate' | 'filter' | 'analyze' | 'rewrite' | 'custom';
}

export interface UpdateCraftTemplateRequest {
  name?: string;
  description?: string;
  aiConfigId?: number;
  promptTemplate?: string;
  category?: 'summarize' | 'translate' | 'filter' | 'analyze' | 'rewrite' | 'custom';
}

export interface GetCraftTemplatesResponse {
  templates: CraftTemplate[];
}

// API functions

/**
 * Get all craft templates for the current user
 */
export async function getCraftTemplates(): Promise<CraftTemplate[]> {
  const response = await fetch('/api/craft-templates', {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await handleAPIResponse<GetCraftTemplatesResponse>(
    response,
  )) as GetCraftTemplatesResponse;
  return data.templates;
}

/**
 * Get a specific craft template by ID
 */
export async function getCraftTemplate(id: number): Promise<CraftTemplate> {
  const response = await fetch(`/api/craft-templates/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  return (await handleAPIResponse<CraftTemplate>(response)) as CraftTemplate;
}

/**
 * Create a new craft template
 */
export async function createCraftTemplate(
  data: CreateCraftTemplateRequest,
): Promise<CraftTemplate> {
  const response = await fetch('/api/craft-templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return (await handleAPIResponse<CraftTemplate>(response)) as CraftTemplate;
}

/**
 * Update an existing craft template
 */
export async function updateCraftTemplate(
  id: number,
  data: UpdateCraftTemplateRequest,
): Promise<CraftTemplate> {
  const response = await fetch(`/api/craft-templates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return (await handleAPIResponse<CraftTemplate>(response)) as CraftTemplate;
}

/**
 * Delete a craft template
 */
export async function deleteCraftTemplate(id: number): Promise<void> {
  const response = await fetch(`/api/craft-templates/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await handleAPIResponse<void>(response);
}

// Category labels for UI display
export const CATEGORY_LABELS: Record<string, string> = {
  summarize: '摘要',
  translate: '翻译',
  filter: '过滤',
  analyze: '分析',
  rewrite: '改写',
  custom: '自定义',
};

// Category options for select dropdown
export const CATEGORY_OPTIONS = [
  { value: 'summarize', label: '摘要' },
  { value: 'translate', label: '翻译' },
  { value: 'filter', label: '过滤' },
  { value: 'analyze', label: '分析' },
  { value: 'rewrite', label: '改写' },
  { value: 'custom', label: '自定义' },
] as const;
