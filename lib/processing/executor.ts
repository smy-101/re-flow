import { generateText } from 'ai';
import { createModelFromConfig, type AIConfigInput, type ModelParams, type ProviderType, type ApiFormat } from '@/lib/ai/providers';
import { decrypt } from '@/lib/auth/encryption';
import { renderPrompt, type PromptContext } from './prompt-renderer';
import type { CraftTemplate, AIConfig } from '@/lib/db/schema';

export interface ExecutionResult {
  output: string;
  tokensUsed: number;
  success: boolean;
  error?: string;
}

/**
 * Convert database AI config to input format for model creation
 */
export function aiConfigToInput(config: AIConfig): AIConfigInput {
  const apiKey = decrypt(config.apiKeyEncrypted, config.apiKeyIv, config.apiKeyTag);

  let modelParams: ModelParams | undefined;
  if (config.modelParams) {
    try {
      modelParams = JSON.parse(config.modelParams) as ModelParams;
    } catch {
      // Ignore parse errors
    }
  }

  return {
    name: config.name,
    providerType: config.providerType as ProviderType,
    providerId: config.providerId ?? undefined,
    apiFormat: config.apiFormat as ApiFormat,
    baseURL: config.baseURL,
    apiKey,
    model: config.model,
    systemPrompt: config.systemPrompt ?? undefined,
    modelParams,
    isDefault: config.isDefault,
    isEnabled: config.isEnabled,
  };
}

/**
 * Execute a craft template on the given context
 */
export async function executeTemplate(
  template: CraftTemplate,
  aiConfig: AIConfig,
  context: PromptContext,
): Promise<ExecutionResult> {
  try {
    // Render the prompt
    const renderedPrompt = renderPrompt(template.promptTemplate, context);

    // Create model from config
    const configInput = aiConfigToInput(aiConfig);
    const model = createModelFromConfig(configInput);

    // Build options for generateText
    const options: {
      model: ReturnType<typeof createModelFromConfig>;
      prompt: string;
      system?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    } = {
      model,
      prompt: renderedPrompt,
    };

    // Add system prompt if available
    if (aiConfig.systemPrompt) {
      options.system = aiConfig.systemPrompt;
    }

    // Add model params if available
    if (configInput.modelParams) {
      if (configInput.modelParams.temperature !== undefined) {
        options.temperature = configInput.modelParams.temperature;
      }
      if (configInput.modelParams.maxTokens !== undefined) {
        options.maxTokens = configInput.modelParams.maxTokens;
      }
      if (configInput.modelParams.topP !== undefined) {
        options.topP = configInput.modelParams.topP;
      }
    }
    console.log('Executing template with options:', options);
    // Execute the AI call
    const result = await generateText(options);
    console.log('AI generation result:', result);
    return {
      output: result.text,
      tokensUsed: result.usage?.totalTokens ?? 0,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      output: '',
      tokensUsed: 0,
      success: false,
      error: errorMessage,
    };
  }
}
