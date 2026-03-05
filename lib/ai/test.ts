import { generateText } from 'ai';
import { createModelFromConfig } from './providers';
import type { AIConfigInput } from './providers';

export interface TestResult {
  success: boolean;
  error?: string;
  latency?: number; // milliseconds
  provider?: string;
  model?: string;
}

const TEST_PROMPTS = {
  openai: 'Hello, please respond with "OK" if you can understand this message.',
  anthropic: 'Hello. Please respond with "OK" if you understand this message.',
};

export async function testAIConfig(
  config: AIConfigInput,
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const model = createModelFromConfig(config);

    // Use the appropriate test prompt based on API format
    const testPrompt = TEST_PROMPTS[config.apiFormat];

    const result = await generateText({
      model,
      prompt: testPrompt,
    });
    console.log('Test result:', result);
    const latency = Date.now() - startTime;

    // Check if the response contains "OK" (case insensitive)
    const responseText = result.text.toLowerCase();
    const isValidResponse = responseText.includes('ok');

    if (!isValidResponse) {
      return {
        success: false,
        error: `Unexpected response: ${result.text}`,
        latency,
        provider: config.providerType,
        model: config.model,
      };
    }

    return {
      success: true,
      latency,
      provider: config.providerType,
      model: config.model,
    };
  } catch (error) {
    console.error('Error testing AI config:', error);
    const latency = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return {
      success: false,
      error: errorMessage,
      latency,
      provider: config.providerType,
      model: config.model,
    };
  }
}

/**
 * Validates an AI configuration without actually calling the API
 */
export function validateAIConfig(config: Partial<AIConfigInput>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Name validation
  if (!config.name || config.name.trim().length === 0) {
    errors.push('配置名称不能为空');
  } else if (config.name.length < 3) {
    errors.push('配置名称至少需要 3 个字符');
  } else if (config.name.length > 50) {
    errors.push('配置名称不能超过 50 个字符');
  }

  // API key validation
  if (!config.apiKey || config.apiKey.trim().length === 0) {
    errors.push('API Key 不能为空');
  }

  // Model validation
  if (!config.model || config.model.trim().length === 0) {
    errors.push('模型名称不能为空');
  }

  // Base URL validation
  if (config.baseURL) {
    try {
      new URL(config.baseURL);
    } catch {
      errors.push('API 地址格式无效');
    }
  }

  // API format validation for custom provider
  if (config.providerType === 'custom' && !config.apiFormat) {
    errors.push('自定义供应商必须选择 API 兼容格式');
  }

  // Temperature validation
  if (config.modelParams?.temperature !== undefined) {
    const { temperature } = config.modelParams;
    if (config.apiFormat === 'openai') {
      if (temperature < 0 || temperature > 2) {
        errors.push('OpenAI 格式的 Temperature 必须在 0-2 之间');
      }
    } else if (config.apiFormat === 'anthropic') {
      if (temperature < 0 || temperature > 1) {
        errors.push('Anthropic 格式的 Temperature 必须在 0-1 之间');
      }
    }
  }

  // Top P validation
  if (config.modelParams?.topP !== undefined) {
    const { topP } = config.modelParams;
    if (topP < 0 || topP > 1) {
      errors.push('Top P 必须在 0-1 之间');
    }
  }

  // Max tokens validation
  if (config.modelParams?.maxTokens !== undefined) {
    const { maxTokens } = config.modelParams;
    if (!Number.isInteger(maxTokens) || maxTokens < 1) {
      errors.push('Max Tokens 必须是正整数');
    }
  }

  // Frequency penalty validation (OpenAI only)
  if (
    config.apiFormat === 'openai' &&
    config.modelParams?.frequencyPenalty !== undefined
  ) {
    const { frequencyPenalty } = config.modelParams;
    if (frequencyPenalty < -2 || frequencyPenalty > 2) {
      errors.push('Frequency Penalty 必须在 -2 到 2 之间');
    }
  }

  // Presence penalty validation (OpenAI only)
  if (
    config.apiFormat === 'openai' &&
    config.modelParams?.presencePenalty !== undefined
  ) {
    const { presencePenalty } = config.modelParams;
    if (presencePenalty < -2 || presencePenalty > 2) {
      errors.push('Presence Penalty 必须在 -2 到 2 之间');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
