import type { LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

// Type definitions
export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'openai-compatible'
  | 'anthropic-compatible'
  | 'custom';

export type ApiFormat = 'openai' | 'anthropic';

export type HealthStatus = 'unverified' | 'active' | 'error';

export interface PresetProvider {
  id: string;
  name: string;
  type: ProviderType;
  apiFormat: ApiFormat;
  defaultBaseURL: string;
  defaultModels?: string[];
}

export interface ModelParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIConfigInput {
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

export interface AIConfig extends AIConfigInput {
  id: number;
  userId: number;
  isDefault: boolean;
  isEnabled: boolean;
  healthStatus: HealthStatus;
  lastError?: string;
  lastErrorAt?: number | null;
  createdAt: number;
  updatedAt: number;
}

// Type for provider model function
type ProviderModelFunction = (modelId: string, settings?: unknown) => LanguageModel;

// Preset providers configuration
export const PRESET_PROVIDERS: PresetProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI (官方)',
    type: 'openai',
    apiFormat: 'openai',
    defaultBaseURL: 'https://api.openai.com/v1',
    defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic (官方)',
    type: 'anthropic',
    apiFormat: 'anthropic',
    defaultBaseURL: 'https://api.anthropic.com/v1',
    defaultModels: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://api.deepseek.com/v1',
    defaultModels: ['deepseek-chat', 'deepseek-coder'],
  },
  {
    id: 'qwen',
    name: '通义千问 (Qwen)',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModels: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  },
  {
    id: 'zhipu',
    name: '智谱 AI (GLM)',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModels: ['glm-4', 'glm-4-flash', 'glm-4-plus'],
  },
  {
    id: 'moonshot',
    name: '月之暗面 (Moonshot)',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://api.moonshot.cn/v1',
    defaultModels: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  },
  {
    id: 'custom',
    name: '自定义',
    type: 'custom',
    apiFormat: 'openai',
    defaultBaseURL: '',
    defaultModels: [],
  },
];

export function getPresetProvider(providerId: string): PresetProvider | undefined {
  return PRESET_PROVIDERS.find((p) => p.id === providerId);
}

/**
 * Creates a Vercel AI SDK LanguageModel from an AI configuration
 * @param config - The AI configuration
 * @returns A LanguageModel instance
 */
export function createModelFromConfig(config: AIConfigInput): LanguageModel {
  const { apiFormat, baseURL, apiKey, model } = config;

  if (apiFormat === 'openai') {
    const provider = createOpenAI({
      baseURL,
      apiKey,
    });

    const settings: Record<string, unknown> = {};

    // Add optional model parameters
    if (config.modelParams) {
      if (config.modelParams.temperature !== undefined) {
        settings.temperature = config.modelParams.temperature;
      }
      if (config.modelParams.maxTokens !== undefined) {
        settings.maxTokens = config.modelParams.maxTokens;
      }
      if (config.modelParams.topP !== undefined) {
        settings.topP = config.modelParams.topP;
      }
      if (config.modelParams.frequencyPenalty !== undefined) {
        settings.frequencyPenalty = config.modelParams.frequencyPenalty;
      }
      if (config.modelParams.presencePenalty !== undefined) {
        settings.presencePenalty = config.modelParams.presencePenalty;
      }
    }

    // Add extra parameters if provided
    if (config.extraParams) {
      Object.assign(settings, config.extraParams);
    }

    return (provider as ProviderModelFunction)(model, settings);
  }

  if (apiFormat === 'anthropic') {
    const provider = createAnthropic({
      baseURL,
      apiKey,
    });

    const settings: Record<string, unknown> = {};

    // Add optional model parameters (Anthropic has different parameters)
    if (config.modelParams) {
      if (config.modelParams.temperature !== undefined) {
        settings.temperature = config.modelParams.temperature;
      }
      if (config.modelParams.maxTokens !== undefined) {
        settings.maxTokens = config.modelParams.maxTokens;
      }
      if (config.modelParams.topP !== undefined) {
        settings.topP = config.modelParams.topP;
      }
    }

    // Add extra parameters if provided (but exclude customModelId)
    if (config.extraParams) {
      Object.assign(settings, config.extraParams);
    }

    return (provider as ProviderModelFunction)(model, settings);
  }

  throw new Error(`Unsupported API format: ${apiFormat}`);
}

/**
 * Gets default base URL for a provider
 */
export function getDefaultBaseURL(providerId: string): string {
  const provider = getPresetProvider(providerId);
  return provider?.defaultBaseURL || '';
}

/**
 * Gets default models for a provider
 */
export function getDefaultModels(providerId: string): string[] {
  const provider = getPresetProvider(providerId);
  return provider?.defaultModels || [];
}

/**
 * Masks API key for display
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) {
    return '••••••••';
  }
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
}
