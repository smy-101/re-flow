import type {
  ApiFormat,
  ModelParams,
  ProviderType,
} from '@/lib/ai/providers';
import type { AIConfig as ProviderAIConfig } from '@/lib/ai/providers';

// Re-export types from providers
export type {
  ApiFormat,
  ModelParams,
  ProviderType,
  PRESET_PROVIDERS,
} from '@/lib/ai/providers';
export {
  getPresetProvider,
  getDefaultBaseURL,
  getDefaultModels,
  maskApiKey,
  type PresetProvider,
  type AIConfigInput,
} from '@/lib/ai/providers';

// Additional types for API responses
export interface AIConfig extends ProviderAIConfig {
  apiKey: string; // masked
}

export interface CreateAIConfigRequest {
  name: string;
  providerType: ProviderType;
  providerId?: string;
  apiFormat: ApiFormat;
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
  modelParams?: ModelParams;
  isDefault?: boolean;
  isEnabled?: boolean;
  extraParams?: Record<string, unknown>;
}

export interface UpdateAIConfigRequest {
  name?: string;
  providerType?: ProviderType;
  providerId?: string;
  apiFormat?: ApiFormat;
  baseURL?: string;
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  modelParams?: ModelParams;
  isEnabled?: boolean;
  extraParams?: Record<string, unknown>;
}

export interface TestResult {
  success: boolean;
  error?: string;
  latency?: number;
  provider?: string;
  model?: string;
}

export interface ValidationError {
  valid: boolean;
  errors: string[];
}

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

/**
 * Get all AI configurations for the current user
 */
export async function getAIConfigs(): Promise<AIConfig[]> {
  const response = await fetch('/api/ai-configs', {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await handleAPIResponse<{ configs: AIConfig[] }>(
    response,
  )) as { configs: AIConfig[] };
  return data.configs;
}

/**
 * Create a new AI configuration
 */
export async function createAIConfig(
  data: CreateAIConfigRequest,
): Promise<AIConfig> {
  const response = await fetch('/api/ai-configs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return (await handleAPIResponse<AIConfig>(response)) as AIConfig;
}

/**
 * Get a specific AI configuration by ID
 */
export async function getAIConfig(id: number): Promise<AIConfig> {
  const response = await fetch(`/api/ai-configs/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  return (await handleAPIResponse<AIConfig>(response)) as AIConfig;
}

/**
 * Update an existing AI configuration
 */
export async function updateAIConfig(
  id: number,
  data: UpdateAIConfigRequest,
): Promise<AIConfig> {
  const response = await fetch(`/api/ai-configs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  return (await handleAPIResponse<AIConfig>(response)) as AIConfig;
}

/**
 * Delete an AI configuration
 */
export async function deleteAIConfig(id: number): Promise<void> {
  const response = await fetch(`/api/ai-configs/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await handleAPIResponse<void>(response);
}

/**
 * Test an existing AI configuration
 */
export async function testAIConfig(id: number): Promise<TestResult> {
  const response = await fetch(`/api/ai-configs/${id}/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  return (await handleAPIResponse<TestResult>(response)) as TestResult;
}

/**
 * Test an AI configuration without saving it (for validation before create/update)
 */
export async function testAIConfigDirect(
  config: CreateAIConfigRequest,
): Promise<TestResult> {
  const response = await fetch('/api/ai-configs/test-direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(config),
  });

  return (await handleAPIResponse<TestResult>(response)) as TestResult;
}

/**
 * Set an AI configuration as the default
 */
export async function setDefaultConfig(id: number): Promise<void> {
  const response = await fetch(`/api/ai-configs/${id}/set-default`, {
    method: 'PUT',
    credentials: 'include',
  });

  await handleAPIResponse<void>(response);
}

/**
 * Toggle the enabled state of an AI configuration
 */
export async function toggleConfigEnabled(id: number): Promise<AIConfig> {
  const response = await fetch(`/api/ai-configs/${id}/toggle`, {
    method: 'PUT',
    credentials: 'include',
  });

  return (await handleAPIResponse<AIConfig>(response)) as AIConfig;
}

/**
 * Get preset providers
 */
export async function getPresetProviders(): Promise<
  import('@/lib/ai/providers').PresetProvider[]
> {
  const response = await fetch('/api/ai-configs/presets', {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await handleAPIResponse<{
    providers: import('@/lib/ai/providers').PresetProvider[];
  }>(response)) as { providers: import('@/lib/ai/providers').PresetProvider[] };

  return data.providers;
}
