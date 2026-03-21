import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processArticlesForDigest } from '@/lib/digest/ai-processor';
import { db } from '@/lib/db';
import { processingResults, pipelines, craftTemplates, aiConfigs } from '@/lib/db/schema';
import { createMockItem, createMockFeed } from '@/__tests__/utils/factory';

// Mock the pipeline executor module
vi.mock('@/lib/processing/pipeline-executor', () => ({
  executePipeline: vi.fn(),
  executeSingleTemplate: vi.fn(),
}));

import { executePipeline, executeSingleTemplate } from '@/lib/processing/pipeline-executor';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      feedItems: {
        findMany: vi.fn(),
      },
      feeds: {
        findMany: vi.fn(),
      },
      processingResults: {
        findFirst: vi.fn(),
      },
      pipelines: {
        findFirst: vi.fn(),
      },
      craftTemplates: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      aiConfigs: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
  },
}));

describe('Digest AI Processor', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('processArticlesForDigest', () => {
    describe('Filter Items Needing Processing', () => {
      it('should skip items from feeds without autoProcess enabled', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1 });
        const mockFeed = createMockFeed({ id: 1, userId: 1, autoProcess: false });

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(0);
        expect(result.articlesSkipped).toBe(0);
        expect(executePipeline).not.toHaveBeenCalled();
        expect(executeSingleTemplate).not.toHaveBeenCalled();
      });

      it('should skip items from feeds without pipelineId or templateId', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1 });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          pipelineId: null,
          templateId: null,
        });

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(0);
        expect(executePipeline).not.toHaveBeenCalled();
        expect(executeSingleTemplate).not.toHaveBeenCalled();
      });

      it('should skip items that already have processing results', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1 });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          templateId: 5,
        });

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue({
          id: 1,
          feedItemId: 1,
          status: 'done',
        } as unknown as typeof processingResults.$inferSelect);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(0);
        expect(executeSingleTemplate).not.toHaveBeenCalled();
      });

      it('should return empty result when no feed item IDs provided', async () => {
        const result = await processArticlesForDigest(1, []);

        expect(result.success).toBe(true);
        expect(result.articlesProcessed).toBe(0);
        expect(db.query.feedItems.findMany).not.toHaveBeenCalled();
      });
    });

    describe('Pipeline Execution', () => {
      it('should execute pipeline for items with pipelineId', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Test Article' });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          pipelineId: 10,
          templateId: null,
        });
        const mockPipeline = {
          id: 10,
          userId: 1,
          name: 'Test Pipeline',
          steps: JSON.stringify([{ templateId: 20, order: 0 }]),
        };
        const mockTemplate = {
          id: 20,
          userId: 1,
          name: 'Test Template',
          prompt: 'Summarize',
          aiConfigId: 30,
        };
        const mockAiConfig = {
          id: 30,
          userId: 1,
          name: 'Test Config',
          provider: 'openai',
          apiKey: 'test-key',
        };

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.pipelines.findFirst).mockResolvedValue(mockPipeline as unknown as typeof pipelines.$inferSelect);
        vi.mocked(db.query.craftTemplates.findMany).mockResolvedValue([mockTemplate as unknown as typeof craftTemplates.$inferSelect]);
        vi.mocked(db.query.aiConfigs.findMany).mockResolvedValue([mockAiConfig as unknown as typeof aiConfigs.$inferSelect]);
        vi.mocked(executePipeline).mockResolvedValue({
          success: true,
          output: 'Summary of article',
          stepsOutput: [],
          tokensUsed: 100,
        });
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
        } as unknown as ReturnType<typeof db.insert>);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(1);
        expect(result.results[0]).toMatchObject({
          feedItemId: 1,
          title: 'Test Article',
          success: true,
          output: 'Summary of article',
        });
        expect(executePipeline).toHaveBeenCalled();
      });

      it('should handle pipeline execution failure', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Test Article' });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          pipelineId: 10,
          templateId: null,
        });
        const mockPipeline = {
          id: 10,
          userId: 1,
          name: 'Test Pipeline',
          steps: JSON.stringify([{ templateId: 20, order: 0 }]),
        };
        const mockTemplate = {
          id: 20,
          userId: 1,
          name: 'Test Template',
          prompt: 'Summarize',
          aiConfigId: 30,
        };
        const mockAiConfig = {
          id: 30,
          userId: 1,
          name: 'Test Config',
          provider: 'openai',
          apiKey: 'test-key',
        };

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.pipelines.findFirst).mockResolvedValue(mockPipeline as unknown as typeof pipelines.$inferSelect);
        vi.mocked(db.query.craftTemplates.findMany).mockResolvedValue([mockTemplate as unknown as typeof craftTemplates.$inferSelect]);
        vi.mocked(db.query.aiConfigs.findMany).mockResolvedValue([mockAiConfig as unknown as typeof aiConfigs.$inferSelect]);
        vi.mocked(executePipeline).mockResolvedValue({
          success: false,
          output: '',
          stepsOutput: [],
          tokensUsed: 0,
          error: 'API rate limit exceeded',
        });

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(0);
        expect(result.errors.length).toBe(1);
        expect(result.results[0].success).toBe(false);
        expect(result.results[0].error).toContain('API rate limit exceeded');
      });

      it('should handle missing pipeline', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Test Article' });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          pipelineId: 999,
          templateId: null,
        });

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.pipelines.findFirst).mockResolvedValue(undefined);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(0);
        expect(result.errors.length).toBe(1);
        expect(result.results[0].error).toContain('Pipeline 999 not found');
      });
    });

    describe('Single Template Execution', () => {
      it('should execute single template for items with templateId', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Test Article' });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          pipelineId: null,
          templateId: 20,
        });
        const mockTemplate = {
          id: 20,
          userId: 1,
          name: 'Test Template',
          prompt: 'Translate to Chinese',
          aiConfigId: 30,
        };
        const mockAiConfig = {
          id: 30,
          userId: 1,
          name: 'Test Config',
          provider: 'anthropic',
          apiKey: 'test-key',
        };

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.craftTemplates.findFirst).mockResolvedValue(mockTemplate as unknown as typeof craftTemplates.$inferSelect);
        vi.mocked(db.query.aiConfigs.findFirst).mockResolvedValue(mockAiConfig as unknown as typeof aiConfigs.$inferSelect);
        vi.mocked(executeSingleTemplate).mockResolvedValue({
          success: true,
          output: '翻译结果',
          stepsOutput: [],
          tokensUsed: 50,
        });
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
        } as unknown as ReturnType<typeof db.insert>);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(1);
        expect(result.results[0].output).toBe('翻译结果');
        expect(executeSingleTemplate).toHaveBeenCalled();
      });

      it('should handle missing template', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Test Article' });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          pipelineId: null,
          templateId: 999,
        });

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.craftTemplates.findFirst).mockResolvedValue(undefined);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(0);
        expect(result.errors.length).toBe(1);
        expect(result.results[0].error).toContain('Template 999 not found');
      });

      it('should handle missing AI config', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Test Article' });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          pipelineId: null,
          templateId: 20,
        });
        const mockTemplate = {
          id: 20,
          userId: 1,
          name: 'Test Template',
          prompt: 'Translate',
          aiConfigId: 999,
        };

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.craftTemplates.findFirst).mockResolvedValue(mockTemplate as unknown as typeof craftTemplates.$inferSelect);
        vi.mocked(db.query.aiConfigs.findFirst).mockResolvedValue(undefined);

        const result = await processArticlesForDigest(1, [1]);

        expect(result.articlesProcessed).toBe(0);
        expect(result.errors.length).toBe(1);
        expect(result.results[0].error).toContain('AI config 999 not found');
      });
    });

    describe('Timeout Handling', () => {
      it('should stop processing when max time exceeded', async () => {
        const mockItems = [
          createMockItem({ id: 1, feedId: 1, userId: 1 }),
          createMockItem({ id: 2, feedId: 1, userId: 1 }),
        ];
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          templateId: 20,
        });
        const mockTemplate = {
          id: 20,
          userId: 1,
          name: 'Test Template',
          prompt: 'Test',
          aiConfigId: 30,
        };
        const mockAiConfig = {
          id: 30,
          userId: 1,
          name: 'Test Config',
          provider: 'openai',
          apiKey: 'test-key',
        };

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue(mockItems);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.craftTemplates.findFirst).mockResolvedValue(mockTemplate as unknown as typeof craftTemplates.$inferSelect);
        vi.mocked(db.query.aiConfigs.findFirst).mockResolvedValue(mockAiConfig as unknown as typeof aiConfigs.$inferSelect);

        // Make first call take a long time
        vi.mocked(executeSingleTemplate).mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return {
            success: true,
            output: 'Result',
            stepsOutput: [],
            tokensUsed: 10,
          };
        });
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
        } as unknown as ReturnType<typeof db.insert>);

        // Set very short timeout (50ms)
        const result = await processArticlesForDigest(1, [1, 2], 50);

        // Should have stopped due to timeout
        expect(result.errors).toContain('Processing timed out');
      }, 10000);
    });

    describe('Result Storage', () => {
      it('should store processing results in database', async () => {
        const mockItem = createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Test Article' });
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          templateId: 20,
        });
        const mockTemplate = {
          id: 20,
          userId: 1,
          name: 'Test Template',
          prompt: 'Test',
          aiConfigId: 30,
        };
        const mockAiConfig = {
          id: 30,
          userId: 1,
          name: 'Test Config',
          provider: 'openai',
          apiKey: 'test-key',
        };

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([mockItem]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.craftTemplates.findFirst).mockResolvedValue(mockTemplate as unknown as typeof craftTemplates.$inferSelect);
        vi.mocked(db.query.aiConfigs.findFirst).mockResolvedValue(mockAiConfig as unknown as typeof aiConfigs.$inferSelect);
        vi.mocked(executeSingleTemplate).mockResolvedValue({
          success: true,
          output: 'AI Output',
          stepsOutput: [{ step: 0, templateId: 20, output: 'AI Output', tokensUsed: 100 }],
          tokensUsed: 100,
        });

        const mockInsert = vi.fn().mockReturnValue({
          values: vi.fn().mockReturnThis(),
        });
        vi.mocked(db.insert).mockImplementation(mockInsert as unknown as typeof db.insert);

        await processArticlesForDigest(1, [1]);

        expect(mockInsert).toHaveBeenCalledWith(processingResults);
      });
    });

    describe('Multiple Items Processing', () => {
      it('should process multiple items sequentially', async () => {
        const mockItems = [
          createMockItem({ id: 1, feedId: 1, userId: 1, title: 'Article 1' }),
          createMockItem({ id: 2, feedId: 1, userId: 1, title: 'Article 2' }),
          createMockItem({ id: 3, feedId: 1, userId: 1, title: 'Article 3' }),
        ];
        const mockFeed = createMockFeed({
          id: 1,
          userId: 1,
          autoProcess: true,
          templateId: 20,
        });
        const mockTemplate = {
          id: 20,
          userId: 1,
          name: 'Test Template',
          prompt: 'Test',
          aiConfigId: 30,
        };
        const mockAiConfig = {
          id: 30,
          userId: 1,
          name: 'Test Config',
          provider: 'openai',
          apiKey: 'test-key',
        };

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue(mockItems);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([mockFeed]);
        vi.mocked(db.query.processingResults.findFirst).mockResolvedValue(undefined);
        vi.mocked(db.query.craftTemplates.findFirst).mockResolvedValue(mockTemplate as unknown as typeof craftTemplates.$inferSelect);
        vi.mocked(db.query.aiConfigs.findFirst).mockResolvedValue(mockAiConfig as unknown as typeof aiConfigs.$inferSelect);
        vi.mocked(executeSingleTemplate)
          .mockResolvedValueOnce({ success: true, output: 'Result 1', stepsOutput: [], tokensUsed: 10 })
          .mockResolvedValueOnce({ success: true, output: 'Result 2', stepsOutput: [], tokensUsed: 20 })
          .mockResolvedValueOnce({ success: true, output: 'Result 3', stepsOutput: [], tokensUsed: 30 });
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
        } as unknown as ReturnType<typeof db.insert>);

        const result = await processArticlesForDigest(1, [1, 2, 3]);

        expect(result.articlesProcessed).toBe(3);
        expect(result.results).toHaveLength(3);
        expect(result.results.map((r) => r.output)).toEqual(['Result 1', 'Result 2', 'Result 3']);
      });
    });
  });
});
