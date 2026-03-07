import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPipelines,
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  Pipeline,
  CreatePipelineRequest,
  UpdatePipelineRequest,
} from '@/lib/api/pipelines';
import type { PipelineStep } from '@/lib/db/schema';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/pipelines', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getPipelines', () => {
    it('should return pipelines array on successful fetch', async () => {
      const mockPipelines: Pipeline[] = [
        {
          id: 1,
          userId: 1,
          name: 'Reading Pipeline',
          description: 'Extract and summarize',
          steps: [
            { templateId: 1, order: 0, name: 'Extract' },
            { templateId: 2, order: 1, name: 'Summarize' },
          ],
          createdAt: 1640995200,
          updatedAt: 1640995200,
        },
        {
          id: 2,
          userId: 1,
          name: 'Translation Pipeline',
          description: 'Translate content',
          steps: [{ templateId: 3, order: 0, name: 'Translate' }],
          createdAt: 1640995300,
          updatedAt: 1640995300,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ pipelines: mockPipelines }),
      });

      const result = await getPipelines();

      expect(mockFetch).toHaveBeenCalledWith('/api/pipelines', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockPipelines);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(getPipelines()).rejects.toThrow('Unauthorized');
    });

    it('should throw default error when error property is not present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(getPipelines()).rejects.toThrow('Request failed');
    });
  });

  describe('getPipeline', () => {
    it('should return pipeline on successful fetch', async () => {
      const mockPipeline: Pipeline = {
        id: 1,
        userId: 1,
        name: 'Reading Pipeline',
        description: 'Extract and summarize',
        steps: [
          { templateId: 1, order: 0, name: 'Extract' },
          { templateId: 2, order: 1, name: 'Summarize' },
        ],
        createdAt: 1640995200,
        updatedAt: 1640995200,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPipeline,
      });

      const result = await getPipeline(1);

      expect(mockFetch).toHaveBeenCalledWith('/api/pipelines/1', {
        method: 'GET',
        credentials: 'include',
      });
      expect(result).toEqual(mockPipeline);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(getPipeline(999)).rejects.toThrow('Not found');
    });
  });

  describe('createPipeline', () => {
    it('should create pipeline and return result', async () => {
      const steps: PipelineStep[] = [
        { templateId: 1, order: 0, name: 'Extract' },
        { templateId: 2, order: 1, name: 'Summarize' },
      ];

      const newPipeline: Pipeline = {
        id: 3,
        userId: 1,
        name: 'New Pipeline',
        description: 'A new pipeline',
        steps,
        createdAt: 1640995400,
        updatedAt: 1640995400,
      };

      const input: CreatePipelineRequest = {
        name: 'New Pipeline',
        description: 'A new pipeline',
        steps,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newPipeline,
      });

      const result = await createPipeline(input);

      expect(mockFetch).toHaveBeenCalledWith('/api/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      expect(result).toEqual(newPipeline);
    });

    it('should create pipeline without description', async () => {
      const steps: PipelineStep[] = [
        { templateId: 1, order: 0, name: 'Process' },
      ];

      const newPipeline: Pipeline = {
        id: 3,
        userId: 1,
        name: 'Simple Pipeline',
        description: null,
        steps,
        createdAt: 1640995400,
        updatedAt: 1640995400,
      };

      const input: CreatePipelineRequest = {
        name: 'Simple Pipeline',
        steps,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newPipeline,
      });

      const result = await createPipeline(input);

      expect(result).toEqual(newPipeline);
    });

    it('should throw error on failed creation', async () => {
      const input: CreatePipelineRequest = {
        name: 'ab', // Too short, validation should fail
        steps: [{ templateId: 1, order: 0, name: 'Step' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '管道名称长度必须为 3-50 字符' }),
      });

      await expect(createPipeline(input)).rejects.toThrow(
        '管道名称长度必须为 3-50 字符',
      );
    });

    it('should throw error when no steps provided', async () => {
      const input: CreatePipelineRequest = {
        name: 'Test Pipeline',
        steps: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '请至少添加一个处理步骤' }),
      });

      await expect(createPipeline(input)).rejects.toThrow(
        '请至少添加一个处理步骤',
      );
    });
  });

  describe('updatePipeline', () => {
    it('should update pipeline and return result', async () => {
      const updatedSteps: PipelineStep[] = [
        { templateId: 1, order: 0, name: 'Extract' },
        { templateId: 2, order: 1, name: 'Summarize' },
        { templateId: 3, order: 2, name: 'Translate' },
      ];

      const updatedPipeline: Pipeline = {
        id: 1,
        userId: 1,
        name: 'Updated Pipeline',
        description: 'Updated description',
        steps: updatedSteps,
        createdAt: 1640995200,
        updatedAt: 1640995500,
      };

      const input: UpdatePipelineRequest = {
        name: 'Updated Pipeline',
        description: 'Updated description',
        steps: updatedSteps,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPipeline,
      });

      const result = await updatePipeline(1, input);

      expect(mockFetch).toHaveBeenCalledWith('/api/pipelines/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      expect(result).toEqual(updatedPipeline);
    });

    it('should update pipeline partially', async () => {
      const updatedPipeline: Pipeline = {
        id: 1,
        userId: 1,
        name: 'New Name',
        description: 'Original description',
        steps: [{ templateId: 1, order: 0, name: 'Step' }],
        createdAt: 1640995200,
        updatedAt: 1640995500,
      };

      const input: UpdatePipelineRequest = {
        name: 'New Name',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedPipeline,
      });

      const result = await updatePipeline(1, input);

      expect(result).toEqual(updatedPipeline);
      expect(result.name).toBe('New Name');
    });

    it('should throw error on failed update', async () => {
      const input: UpdatePipelineRequest = {
        name: 'Updated Name',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(updatePipeline(999, input)).rejects.toThrow('Not found');
    });
  });

  describe('deletePipeline', () => {
    it('should delete pipeline successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      await expect(deletePipeline(1)).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith('/api/pipelines/1', {
        method: 'DELETE',
        credentials: 'include',
      });
    });

    it('should throw error on failed deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      await expect(deletePipeline(999)).rejects.toThrow('Not found');
    });
  });
});
