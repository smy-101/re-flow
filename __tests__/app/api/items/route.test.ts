/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/items/route';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      feeds: {
        findMany: vi.fn(),
      },
      feedItems: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock('@/lib/auth/jwt', () => ({
  getUserIdFromToken: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('app/api/items/route', () => {
  let mockCookieStore: { get: ReturnType<typeof vi.fn> };
  let mockRequest: Request;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock cookie store
    mockCookieStore = {
      get: vi.fn(),
    };
    vi.mocked(cookies).mockReturnValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>);

    // Setup mock request
    mockRequest = new Request('http://localhost/api/items', {
      method: 'GET',
    });
  });

  describe('GET', () => {
    it('should return items for authenticated user', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const mockFeeds = [{ id: 1 }, { id: 2 }];
      const mockItems = [
        {
          id: 1,
          feedId: 1,
          title: 'Article 1',
          link: 'https://example.com/1',
          content: 'Content 1',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
      ];

      vi.mocked(db.query.feeds.findMany).mockResolvedValueOnce(mockFeeds as any);
      vi.mocked(db.query.feedItems.findMany).mockResolvedValueOnce(mockItems as any);

      const response = await GET(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockItems);
    });

    it('should filter by feedId when query param provided', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const mockFeeds = [{ id: 1 }];
      const mockItems = [
        {
          id: 1,
          feedId: 1,
          title: 'Article 1',
          link: 'https://example.com/1',
          content: 'Content 1',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
      ];

      vi.mocked(db.query.feeds.findMany).mockResolvedValueOnce(mockFeeds as any);
      vi.mocked(db.query.feedItems.findMany).mockResolvedValueOnce(mockItems as any);

      const requestWithFeedId = new Request('http://localhost/api/items?feedId=1', {
        method: 'GET',
      });

      const response = await GET(requestWithFeedId as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockItems);
    });

    it('should filter by isRead when query param provided', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const mockFeeds = [{ id: 1 }];
      const mockItems = [
        {
          id: 1,
          feedId: 1,
          title: 'Article 1',
          link: 'https://example.com/1',
          content: 'Content 1',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
      ];

      vi.mocked(db.query.feeds.findMany).mockResolvedValueOnce(mockFeeds as any);
      vi.mocked(db.query.feedItems.findMany).mockResolvedValueOnce(mockItems as any);

      const requestWithIsRead = new Request('http://localhost/api/items?isRead=false', {
        method: 'GET',
      });

      const response = await GET(requestWithIsRead as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockItems);
    });

    it('should filter by isFavorite when query param provided', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const mockFeeds = [{ id: 1 }];
      const mockItems = [
        {
          id: 1,
          feedId: 1,
          title: 'Article 1',
          link: 'https://example.com/1',
          content: 'Content 1',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: true,
        },
      ];

      vi.mocked(db.query.feeds.findMany).mockResolvedValueOnce(mockFeeds as any);
      vi.mocked(db.query.feedItems.findMany).mockResolvedValueOnce(mockItems as any);

      const requestWithIsFavorite = new Request('http://localhost/api/items?isFavorite=true', {
        method: 'GET',
      });

      const response = await GET(requestWithIsFavorite as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockItems);
    });

    it('should return 401 if no token provided', async () => {
      mockCookieStore.get.mockReturnValueOnce(undefined);

      const response = await GET(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 401 if token is invalid', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(null);

      mockCookieStore.get.mockReturnValueOnce({ value: 'invalid-token' });

      const response = await GET(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid token');
    });
  });
});
