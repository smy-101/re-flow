import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getQueueStatus,
  getOverallQueueStatus,
  addToQueue,
} from '@/lib/api/queue';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/queue', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getQueueStatus', () => {
    it('should return queue status for a specific feed item', async () => {
        const mockStatus = {
          id: 1,
          status: 'pending',
          position: 3,
          attempts: 0,
          maxAttempts: 3,
          errorMessage: null,
          createdAt: Math.floor(Date.now() / 1000),
          startedAt: null,
          completedAt: null,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockStatus,
        });

        const result = await getQueueStatus(1);

        expect(mockFetch).toHaveBeenCalledWith('/api/queue/status?feed_item_id=1', {
          method: 'GET',
          credentials: 'include',
        });
        expect(result).toEqual(mockStatus);
      });

      it('should return null when no queue job exists', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: null }),
        });

        const result = await getQueueStatus(999);

        expect(result).toBeNull();
      });

      it('should throw error on failed fetch', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Unauthorized' }),
        });

        await expect(getQueueStatus(1)).rejects.toThrow('Unauthorized');
      });
  });

  describe('getOverallQueueStatus', () => {
    it('should return overall queue statistics', async () => {
        const mockStats = {
          pending: 5,
          processing: 1,
          done: 10,
          error: 2,
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockStats,
        });

        const result = await getOverallQueueStatus();

        expect(mockFetch).toHaveBeenCalledWith('/api/queue/status', {
          method: 'GET',
          credentials: 'include',
        });
        expect(result).toEqual(mockStats);
      });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(getOverallQueueStatus()).rejects.toThrow('Unauthorized');
    });
  });

  describe('addToQueue', () => {
    it('should add to queue with templateId and return response', async () => {
      const mockResponse = {
        success: true,
        jobId: 123,
        isNew: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addToQueue({ feedItemId: 1, templateId: 1 });

      expect(mockFetch).toHaveBeenCalledWith('/api/queue/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ feedItemId: 1, templateId: 1 }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should add to queue with pipelineId and return response', async () => {
      const mockResponse = {
        success: true,
        jobId: 124,
        isNew: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addToQueue({ feedItemId: 2, pipelineId: 1 });

      expect(mockFetch).toHaveBeenCalledWith('/api/queue/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ feedItemId: 2, pipelineId: 1 }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return isNew false when item already in queue', async () => {
      const mockResponse = {
        success: true,
        jobId: 100,
        isNew: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addToQueue({ feedItemId: 1, templateId: 1 });

      expect(result.isNew).toBe(false);
      expect(result.jobId).toBe(100);
    });

    it('should throw error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '请选择要处理的文章' }),
      });

      await expect(addToQueue({ feedItemId: 1 })).rejects.toThrow('请选择要处理的文章');
    });

    it('should throw default error when error property is not present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(addToQueue({ feedItemId: 1, templateId: 1 })).rejects.toThrow(
        '加入队列失败',
      );
    });
  });
});
