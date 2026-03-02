/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/feeds/route';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      feeds: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@/lib/auth/jwt', () => ({
  getUserIdFromToken: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('app/api/feeds/route', () => {
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
    mockRequest = new Request('http://localhost/api/feeds', {
      method: 'GET',
    });
  });

  describe('GET', () => {
    it('should return feeds for authenticated user', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const mockFeeds = [
        { id: 1, userId: 1, title: 'Feed 1', unreadCount: 5 },
        { id: 2, userId: 1, title: 'Feed 2', unreadCount: 0 },
      ];

      vi.mocked(db.query.feeds.findMany).mockResolvedValueOnce(mockFeeds as any);
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
      } as any);

      const response = await GET(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFeeds);
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

  describe('POST', () => {
    it('should create feed and return 201', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const newFeed = { id: 1, userId: 1, title: 'New Feed', feedUrl: 'https://example.com/feed.xml' };
      const mockBody = { feedUrl: 'https://example.com/feed.xml', title: 'New Feed' };

      vi.mocked(db.query.feeds.findFirst).mockResolvedValueOnce(null);
      vi.mocked(db.insert).mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValueOnce([newFeed]),
      } as any);

      const postRequest = new Request('http://localhost/api/feeds', {
        method: 'POST',
        body: JSON.stringify(mockBody),
      });

      const response = await POST(postRequest as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newFeed);
    });

    it('should return 400 if feedUrl is missing', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const postRequest = new Request('http://localhost/api/feeds', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(postRequest as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('feedUrl is required');
    });

    it('should return 401 if not authenticated', async () => {
      mockCookieStore.get.mockReturnValueOnce(undefined);

      const postRequest = new Request('http://localhost/api/feeds', {
        method: 'POST',
        body: JSON.stringify({ feedUrl: 'https://example.com/feed.xml' }),
      });

      const response = await POST(postRequest as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 400 if feed already exists', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      const existingFeed = { id: 1, userId: 1, feedUrl: 'https://example.com/feed.xml' };
      vi.mocked(db.query.feeds.findFirst).mockResolvedValueOnce(existingFeed as any);

      const postRequest = new Request('http://localhost/api/feeds', {
        method: 'POST',
        body: JSON.stringify({ feedUrl: 'https://example.com/feed.xml' }),
      });

      const response = await POST(postRequest as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('此订阅已存在');
    });
  });
});
