import type { Pipeline, CraftTemplate, AIConfig, FeedItem, Feed } from '@/lib/db/schema';
import type { PipelineStep, StepOutput } from '@/lib/db/schema';
import { executeTemplate } from './executor';
import { createPromptContext, type PromptContext } from './prompt-renderer';

export interface PipelineExecutionResult {
  output: string;
  stepsOutput: StepOutput[];
  tokensUsed: number;
  success: boolean;
  error?: string;
  failedStep?: number;
}

export interface TemplateWithConfig {
  template: CraftTemplate;
  aiConfig: AIConfig;
}

/**
 * Execute a pipeline on the given feed item
 *
 * @param pipeline - The pipeline to execute
 * @param templatesWithConfigs - Map of template IDs to their templates and AI configs
 * @param item - The feed item to process
 * @param feed - The feed that contains the item
 * @returns The execution result
 */
export async function executePipeline(
  pipeline: Pipeline,
  templatesWithConfigs: Map<number, TemplateWithConfig>,
  item: FeedItem,
  feed: Feed,
): Promise<PipelineExecutionResult> {
  // Parse pipeline steps
  let steps: PipelineStep[];
  try {
    steps = JSON.parse(pipeline.steps) as PipelineStep[];
  } catch {
    return {
      output: '',
      stepsOutput: [],
      tokensUsed: 0,
      success: false,
      error: 'Invalid pipeline steps format',
    };
  }

  // Sort steps by order
  steps = steps.sort((a, b) => a.order - b.order);

  if (steps.length === 0) {
    return {
      output: '',
      stepsOutput: [],
      tokensUsed: 0,
      success: false,
      error: 'Pipeline has no steps',
    };
  }

  const stepsOutput: StepOutput[] = [];
  let currentOutput = '';
  let totalTokensUsed = 0;

  // Execute each step in order
  for (const step of steps) {
    const templateWithConfig = templatesWithConfigs.get(step.templateId);

    if (!templateWithConfig) {
      return {
        output: currentOutput,
        stepsOutput,
        tokensUsed: totalTokensUsed,
        success: false,
        error: `Template not found: ${step.templateId}`,
        failedStep: step.order,
      };
    }

    // Create context with previous output for pipeline steps after the first
    const context: PromptContext = createPromptContext(
      item,
      feed,
      step.order > 0 ? currentOutput : undefined,
    );

    // Execute the template
    const result = await executeTemplate(
      templateWithConfig.template,
      templateWithConfig.aiConfig,
      context,
    );

    if (!result.success) {
      return {
        output: currentOutput,
        stepsOutput,
        tokensUsed: totalTokensUsed,
        success: false,
        error: result.error,
        failedStep: step.order,
      };
    }

    // Record step output
    stepsOutput.push({
      step: step.order,
      templateId: step.templateId,
      output: result.output,
      tokensUsed: result.tokensUsed,
    });

    currentOutput = result.output;
    totalTokensUsed += result.tokensUsed;
  }

  return {
    output: currentOutput,
    stepsOutput,
    tokensUsed: totalTokensUsed,
    success: true,
  };
}

/**
 * Execute a single template on the given feed item
 * This is a convenience function for single template processing
 */
export async function executeSingleTemplate(
  template: CraftTemplate,
  aiConfig: AIConfig,
  item: FeedItem,
  feed: Feed,
): Promise<PipelineExecutionResult> {
  const context = createPromptContext(item, feed);

  const result = await executeTemplate(template, aiConfig, context);

  const stepOutput: StepOutput = {
    step: 0,
    templateId: template.id,
    output: result.output,
    tokensUsed: result.tokensUsed,
  };

  return {
    output: result.output,
    stepsOutput: [stepOutput],
    tokensUsed: result.tokensUsed,
    success: result.success,
    error: result.error,
  };
}
