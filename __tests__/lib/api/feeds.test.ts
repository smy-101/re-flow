import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchFeeds, fetchFeedById, createFeed, updateFeed, deleteFeed } from '@/lib/api/feeds';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/feeds', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchFeeds', () => {
    it('should return feeds array on successful fetch', async () => {
      const mockFeeds = [
        { id: 1, title: 'Test Feed', feedUrl: 'https://example.com/feed.xml' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeeds,
      });

      const result = await fetchFeeds();

      expect(mockFetch).toHaveBeenCalledWith('/api/feeds', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockFeeds);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not authenticated' }),
      });

      await expect(fetchFeeds()).rejects.toThrow('Not authenticated');
    });

    it('should throw error with error property if message not present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(fetchFeeds()).rejects.toThrow('Unauthorized');
    });
  });

  describe('fetchFeedById', () => {
    it('should return feed on successful fetch', async () => {
      const mockFeed = {
        id: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed.xml',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeed,
      });

      const result = await fetchFeedById('1');

      expect(result).toEqual(mockFeed);
    });

    it('should return null on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await fetchFeedById('999');

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchFeedById('1');

      expect(result).toBeNull();
    });
  });

  describe('createFeed', () => {
    it('should create feed and return result', async () => {
      const newFeed = {
        id: 2,
        title: 'New Feed',
        feedUrl: 'https://example.com/new.xml',
      };
      const input = { feedUrl: 'https://example.com/new.xml', title: 'New Feed' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newFeed,
      });

      const result = await createFeed(input);

      expect(mockFetch).toHaveBeenCalledWith('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      expect(result).toEqual(newFeed);
    });

    it('should throw error on failed creation', async () => {
      const input = { feedUrl: 'invalid-url' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid URL' }),
      });

      await expect(createFeed(input)).rejects.toThrow('Invalid URL');
    });
  });

  describe('updateFeed', () => {
    it('should update feed and return result', async () => {
      const updatedFeed = {
        id: 1,
        title: 'Updated Feed',
        feedUrl: 'https://example.com/feed.xml',
      };
      const input = { title: 'Updated Feed' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedFeed,
      });

      const result = await updateFeed('1', input);

      expect(result).toEqual(updatedFeed);
    });

    it('should return null on failed update', async () => {
      const input = { title: 'New Title' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await updateFeed('999', input);

      expect(result).toBeNull();
    });
  });

  describe('deleteFeed', () => {
    it('should delete feed and return true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await deleteFeed('1');

      expect(mockFetch).toHaveBeenCalledWith('/api/feeds/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toBe(true);
    });

    it('should return false on failed deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await deleteFeed('999');

      expect(result).toBe(false);
    });
  });
});
