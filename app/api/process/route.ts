import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  processingResults,
  feedItems,
  feeds,
  craftTemplates,
  pipelines,
  aiConfigs,
  type StepOutput,
  type PipelineStep,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import {
  executePipeline,
  executeSingleTemplate,
  type TemplateWithConfig,
} from '@/lib/processing';

// POST /api/process - Process an article with a template or pipeline
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const body = await request.json();
    const { feedItemId, templateId, pipelineId } = body;

    // Validate feedItemId
    if (!feedItemId || typeof feedItemId !== 'number') {
      return NextResponse.json(
        { error: '请选择要处理的文章' },
        { status: 400 },
      );
    }

    // Validate that either templateId or pipelineId is provided (but not both)
    const hasTemplateId = templateId !== undefined && templateId !== null;
    const hasPipelineId = pipelineId !== undefined && pipelineId !== null;

    if (!hasTemplateId && !hasPipelineId) {
      return NextResponse.json(
        { error: '请选择模板或管道' },
        { status: 400 },
      );
    }

    if (hasTemplateId && hasPipelineId) {
      return NextResponse.json(
        { error: '只能选择模板或管道其中之一' },
        { status: 400 },
      );
    }

    // Fetch the feed item
    const item = await db.query.feedItems.findFirst({
      where: eq(feedItems.id, feedItemId),
    });

    if (!item) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // Verify the item belongs to the user
    if (item.userId !== userId) {
      return NextResponse.json(
        { error: '无权处理此文章' },
        { status: 403 },
      );
    }

    // Fetch the feed
    const feed = await db.query.feeds.findFirst({
      where: eq(feeds.id, item.feedId),
    });

    if (!feed) {
      return NextResponse.json(
        { error: '订阅源不存在' },
        { status: 404 },
      );
    }

    // Create processing result with pending status
    const [processingResult] = await db
      .insert(processingResults)
      .values({
        userId,
        feedItemId,
        templateId: hasTemplateId ? templateId : null,
        pipelineId: hasPipelineId ? pipelineId : null,
        status: 'processing',
        createdAt: Date.now(),
      })
      .returning();

    try {
      let output: string;
      let stepsOutput: StepOutput[];
      let tokensUsed: number;

      if (hasTemplateId) {
        // Process with single template
        const template = await db.query.craftTemplates.findFirst({
          where: eq(craftTemplates.id, templateId),
        });

        if (!template) {
          throw new Error('模板不存在');
        }

        if (template.userId !== userId) {
          throw new Error('无权使用此模板');
        }

        // Fetch AI config
        const aiConfig = await db.query.aiConfigs.findFirst({
          where: eq(aiConfigs.id, template.aiConfigId),
        });

        if (!aiConfig) {
          throw new Error('AI 配置不存在');
        }

        if (aiConfig.userId !== userId) {
          throw new Error('无权使用此 AI 配置');
        }

        const result = await executeSingleTemplate(template, aiConfig, item, feed);
        console.log('Single template execution result:', result);
        if (!result.success) {
          throw new Error(result.error ?? '处理失败');
        }

        output = result.output;
        stepsOutput = result.stepsOutput;
        tokensUsed = result.tokensUsed;
      } else {
        // Process with pipeline
        const pipeline = await db.query.pipelines.findFirst({
          where: eq(pipelines.id, pipelineId),
        });

        if (!pipeline) {
          throw new Error('管道不存在');
        }

        if (pipeline.userId !== userId) {
          throw new Error('无权使用此管道');
        }

        // Parse pipeline steps
        const steps = JSON.parse(pipeline.steps) as PipelineStep[];

        // Fetch all templates and their AI configs
        const templatesWithConfigs = new Map<number, TemplateWithConfig>();

        for (const step of steps) {
          if (!templatesWithConfigs.has(step.templateId)) {
            const template = await db.query.craftTemplates.findFirst({
              where: eq(craftTemplates.id, step.templateId),
            });

            if (!template) {
              throw new Error(`模板不存在: ${step.name}`);
            }

            if (template.userId !== userId) {
              throw new Error(`无权使用模板: ${step.name}`);
            }

            const aiConfig = await db.query.aiConfigs.findFirst({
              where: eq(aiConfigs.id, template.aiConfigId),
            });

            if (!aiConfig) {
              throw new Error(`AI 配置不存在: ${step.name}`);
            }

            if (aiConfig.userId !== userId) {
              throw new Error(`无权使用 AI 配置: ${step.name}`);
            }

            templatesWithConfigs.set(step.templateId, { template, aiConfig });
          }
        }

        const result = await executePipeline(
          pipeline,
          templatesWithConfigs,
          item,
          feed,
        );

        if (!result.success) {
          throw new Error(result.error ?? '处理失败');
        }

        output = result.output;
        stepsOutput = result.stepsOutput;
        tokensUsed = result.tokensUsed;
      }

      // Update processing result with success
      const [updatedResult] = await db
        .update(processingResults)
        .set({
          status: 'done',
          output,
          stepsOutput: JSON.stringify(stepsOutput),
          tokensUsed,
          completedAt: Date.now(),
        })
        .where(eq(processingResults.id, processingResult.id))
        .returning();

      return NextResponse.json({
        ...updatedResult,
        stepsOutput,
      });
    } catch (error) {
      // Update processing result with error
      const errorMessage =
        error instanceof Error ? error.message : '处理失败';

      await db
        .update(processingResults)
        .set({
          status: 'error',
          errorMessage,
          completedAt: Date.now(),
        })
        .where(eq(processingResults.id, processingResult.id));

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing article:', error);
    return NextResponse.json(
      { error: '处理文章失败' },
      { status: 500 },
    );
  }
}
