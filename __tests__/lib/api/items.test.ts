import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchItems, fetchItemById, markAsRead, toggleFavorite, markAllAsRead } from '@/lib/api/items';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/items', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('fetchItems', () => {
    it('should return items array on successful fetch', async () => {
      const mockItems = [
        {
          id: 1,
          feedId: 1,
          title: 'Test Article',
          link: 'https://example.com/article',
          content: 'Article content',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      });

      const result = await fetchItems();

      expect(mockFetch).toHaveBeenCalled();
      expect(result).toEqual(mockItems);
    });

    it('should pass query parameters as URL search params', async () => {
      const mockItems = [];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItems,
      });

      await fetchItems({ feedId: '1', isRead: false, isFavorite: true });

      const callArgs = mockFetch.mock.calls[0][0];
      expect(callArgs).toContain('feedId=1');
      expect(callArgs).toContain('isRead=false');
      expect(callArgs).toContain('isFavorite=true');
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error fetching items' }),
      });

      await expect(fetchItems()).rejects.toThrow('Error fetching items');
    });
  });

  describe('fetchItemById', () => {
    it('should return item on successful fetch', async () => {
      const mockItem = {
        id: 1,
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content',
        publishedAt: Date.now(),
        isRead: false,
        isFavorite: false,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem,
      });

      const result = await fetchItemById('1');

      expect(result).toEqual(mockItem);
    });

    it('should return null on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await fetchItemById('999');

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchItemById('1');

      expect(result).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('should mark item as read and return updated item', async () => {
      const updatedItem = {
        id: 1,
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content',
        publishedAt: Date.now(),
        isRead: true,
        isFavorite: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedItem,
      });

      const result = await markAsRead('1', true);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/items/1/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      expect(result).toEqual(updatedItem);
    });

    it('should mark item as unread when isRead is false', async () => {
      const updatedItem = {
        id: 1,
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content',
        publishedAt: Date.now(),
        isRead: false,
        isFavorite: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedItem,
      });

      const result = await markAsRead('1', false);

      expect(result).toEqual(updatedItem);
    });

    it('should return null on failed update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await markAsRead('999', true);

      expect(result).toBeNull();
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status and return updated item', async () => {
      const updatedItem = {
        id: 1,
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content',
        publishedAt: Date.now(),
        isRead: false,
        isFavorite: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedItem,
      });

      const result = await toggleFavorite('1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/items/1/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(updatedItem);
    });

    it('should return null on failed toggle', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Not found' }),
      });

      const result = await toggleFavorite('999');

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await toggleFavorite('1');

      expect(result).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all items as read without feedId', async () => {
      const response = { success: true, count: 15 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await markAllAsRead();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/items/mark-all-read'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(response);
    });

    it('should mark all items as read with feedId', async () => {
      const response = { success: true, count: 5 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      });

      const result = await markAllAsRead(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/feeds/1/mark-all-read'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(response);
    });

    it('should return success: false on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error' }),
      });

      const result = await markAllAsRead();

      expect(result).toEqual({ success: false, count: 0 });
    });

    it('should return success: false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await markAllAsRead();

      expect(result).toEqual({ success: false, count: 0 });
    });
  });
});
