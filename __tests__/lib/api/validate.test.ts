import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateFeedUrl } from '@/lib/api/validate';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/validate', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('validateFeedUrl', () => {
    it('should return valid result with title on successful validation', async () => {
      const mockResponse = {
        valid: true,
        title: 'Example Feed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await validateFeedUrl('https://example.com/feed.xml');

      expect(mockFetch).toHaveBeenCalledWith('/api/feeds/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl: 'https://example.com/feed.xml' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return invalid result on validation failure', async () => {
      const mockResponse = {
        valid: false,
        error: '无法解析此 RSS feed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await validateFeedUrl('https://example.com/invalid.xml');

      expect(result).toEqual(mockResponse);
    });

    it('should return invalid result on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const result = await validateFeedUrl('https://example.com/feed.xml');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should return error message with error property if message not present', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation failed' }),
      });

      const result = await validateFeedUrl('https://example.com/feed.xml');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should return network error on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await validateFeedUrl('https://example.com/feed.xml');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Network error during validation');
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = await validateFeedUrl('https://example.com/feed.xml');

      expect(result.valid).toBe(false);
    });
  });
});
