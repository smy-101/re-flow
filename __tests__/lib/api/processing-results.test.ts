import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  processArticle,
  getProcessingResults,
  getProcessingResult,
  getFeedItemProcessingHistory,
  type ProcessingResult,
} from '@/lib/api/processing-results';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/processing-results', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('processArticle', () => {
    it('should process article with template', async () => {
      const mockResult: ProcessingResult = {
        id: 1,
        userId: 1,
        feedItemId: 123,
        pipelineId: null,
        templateId: 1,
        output: 'Processed content',
        stepsOutput: [{ step: 0, templateId: 1, output: 'Processed content', tokensUsed: 100 }],
        status: 'done',
        errorMessage: null,
        tokensUsed: 100,
        createdAt: 1640995200,
        completedAt: 1640995300,
        templateName: 'Summary Template',
        pipelineName: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await processArticle({
        feedItemId: 123,
        templateId: 1,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ feedItemId: 123, templateId: 1 }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should process article with pipeline', async () => {
      const mockResult: ProcessingResult = {
        id: 1,
        userId: 1,
        feedItemId: 123,
        pipelineId: 1,
        templateId: null,
        output: 'Pipeline output',
        stepsOutput: [
          { step: 0, templateId: 1, output: 'Step 1 output', tokensUsed: 50 },
          { step: 1, templateId: 2, output: 'Step 2 output', tokensUsed: 75 },
        ],
        status: 'done',
        errorMessage: null,
        tokensUsed: 125,
        createdAt: 1640995200,
        completedAt: 1640995300,
        templateName: null,
        pipelineName: 'Reading Pipeline',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await processArticle({
        feedItemId: 123,
        pipelineId: 1,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ feedItemId: 123, pipelineId: 1 }),
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error on failed processing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '模板不存在' }),
      });

      await expect(processArticle({ feedItemId: 123, templateId: 999 })).rejects.toThrow(
        '模板不存在',
      );
    });

    it('should throw default error when error property is not present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(processArticle({ feedItemId: 123, templateId: 1 })).rejects.toThrow(
        '处理失败',
      );
    });
  });

  describe('getProcessingResults', () => {
    it('should return results array on successful fetch', async () => {
      const mockResults: ProcessingResult[] = [
        {
          id: 1,
          userId: 1,
          feedItemId: 123,
          pipelineId: null,
          templateId: 1,
          output: 'Result 1',
          stepsOutput: null,
          status: 'done',
          errorMessage: null,
          tokensUsed: 100,
          createdAt: 1640995200,
          completedAt: 1640995300,
          templateName: 'Template 1',
          pipelineName: null,
        },
        {
          id: 2,
          userId: 1,
          feedItemId: 124,
          pipelineId: 1,
          templateId: null,
          output: 'Result 2',
          stepsOutput: null,
          status: 'done',
          errorMessage: null,
          tokensUsed: 200,
          createdAt: 1640995300,
          completedAt: 1640995400,
          templateName: null,
          pipelineName: 'Pipeline 1',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockResults }),
      });

      const result = await getProcessingResults();

      expect(mockFetch).toHaveBeenCalledWith('/api/processing-results', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockResults);
    });

    it('should include query parameters when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await getProcessingResults({ status: 'done', limit: 10, offset: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/processing-results?'),
        expect.any(Object),
      );
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('status=done');
      expect(callUrl).toContain('limit=10');
      expect(callUrl).toContain('offset=20');
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(getProcessingResults()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getProcessingResult', () => {
    it('should return result on successful fetch', async () => {
      const mockResult: ProcessingResult = {
        id: 1,
        userId: 1,
        feedItemId: 123,
        pipelineId: null,
        templateId: 1,
        output: 'Result content',
        stepsOutput: [{ step: 0, templateId: 1, output: 'Result content', tokensUsed: 100 }],
        status: 'done',
        errorMessage: null,
        tokensUsed: 100,
        createdAt: 1640995200,
        completedAt: 1640995300,
        templateName: 'Summary',
        pipelineName: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await getProcessingResult(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/processing-results/1', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(getProcessingResult(999)).rejects.toThrow('Not found');
    });
  });

  describe('getFeedItemProcessingHistory', () => {
    it('should return history array on successful fetch', async () => {
      const mockHistory: ProcessingResult[] = [
        {
          id: 1,
          userId: 1,
          feedItemId: 123,
          pipelineId: null,
          templateId: 1,
          output: 'First processing',
          stepsOutput: null,
          status: 'done',
          errorMessage: null,
          tokensUsed: 100,
          createdAt: 1640995200,
          completedAt: 1640995300,
          templateName: 'Summary',
          pipelineName: null,
        },
        {
          id: 2,
          userId: 1,
          feedItemId: 123,
          pipelineId: 1,
          templateId: null,
          output: 'Second processing',
          stepsOutput: null,
          status: 'done',
          errorMessage: null,
          tokensUsed: 150,
          createdAt: 1640995400,
          completedAt: 1640995500,
          templateName: null,
          pipelineName: 'Full Pipeline',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockHistory }),
      });

      const result = await getFeedItemProcessingHistory(123);

      expect(mockFetch).toHaveBeenCalledWith('/api/feed-items/123/processing-results', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockHistory);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Article not found' }),
      });

      await expect(getFeedItemProcessingHistory(999)).rejects.toThrow('Article not found');
    });
  });
});
