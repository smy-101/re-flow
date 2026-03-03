/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/favorites/count/route';
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
  },
}));

vi.mock('@/lib/auth/jwt', () => ({
  getUserIdFromToken: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('app/api/favorites/count/route', () => {
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
    mockRequest = new Request('http://localhost/api/favorites/count', {
      method: 'GET',
    });

    // Setup db.query.feeds.findMany mock
    vi.mocked(db.query.feeds.findMany).mockResolvedValueOnce([
      { id: 1 },
      { id: 2 },
    ] as any);
  });

  describe('GET', () => {
    it('should return favorite count for authenticated user', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      // Setup db.select mock to return mock data
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValueOnce([{ count: 3 }]),
        }),
      } as any);

      const response = await GET(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ count: 3 });
    });

    it('should return 0 when user has no favorites', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      // Setup db.select mock to return 0
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValueOnce([{ count: 0 }]),
        }),
      } as any);

      const response = await GET(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ count: 0 });
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

    it('should return 500 on database error', async () => {
      const { getUserIdFromToken } = await import('@/lib/auth/jwt');
      vi.mocked(getUserIdFromToken).mockResolvedValueOnce(1);

      mockCookieStore.get.mockReturnValueOnce({ value: 'valid-token' });

      // Setup db.query.feeds.findMany to throw error
      vi.mocked(db.query.feeds.findMany).mockRejectedValueOnce(new Error('Database error') as any);

      // The select() call should fail before being executed due to findMany error
      // Set a mock that will handle this gracefully
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation(() => {
            throw new Error('Database error');
          }),
        }),
      } as any);

      const response = await GET(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch favorite count');
    });
  });
});
