import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getQueueStatus,
  getOverallQueueStatus,
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
});
