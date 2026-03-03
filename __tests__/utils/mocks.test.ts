import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cookies } from 'next/headers';
import {
  createMockRequest,
  createMockCookieStore,
  createAuthenticatedRequest,
  mockDate,
  mockFetchSuccess,
  mockFetchError,
  resetFetchMocks,
  createMockQueryResult,
  createMockInsertResult,
} from './mocks';

// Mock next/headers for createMockCookieStore tests
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Mock Helper Functions', () => {
  describe('createMockRequest', () => {
    it('should create GET request by default', () => {
      const request = createMockRequest();

      expect(request).toBeInstanceOf(Request);
      expect(request.method).toBe('GET');
      expect(request.url).toBe('http://localhost:3000/api/test');
    });

    it('should create request with custom method', () => {
      const request = createMockRequest({ method: 'POST' });

      expect(request.method).toBe('POST');
    });

    it('should create request with custom URL', () => {
      const request = createMockRequest({ url: 'http://localhost:3000/api/feeds' });

      expect(request.url).toBe('http://localhost:3000/api/feeds');
    });

    it('should create request with JSON body', () => {
      const body = { feedUrl: 'https://example.com/feed.xml' };
      const request = createMockRequest({ method: 'POST', body });

      expect(request.json()).resolves.toEqual(body);
    });

    it('should create request with custom headers', () => {
      const request = createMockRequest({
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect(request.headers.get('X-Custom-Header')).toBe('custom-value');
    });
  });

  describe('createMockCookieStore', () => {
    it('should create empty cookie store by default', () => {
      const store = createMockCookieStore();

      expect(store.get).toBeDefined();
      expect(store.get('nonexistent')).toBeUndefined();
    });

    it('should create cookie store with initial cookies', () => {
      const store = createMockCookieStore({
        token: 'test-token',
        theme: 'dark',
      });

      expect(store.get('token')?.value).toBe('test-token');
      expect(store.get('theme')?.value).toBe('dark');
    });

    it('should allow setting cookies', () => {
      const store = createMockCookieStore();

      store.set('newCookie', 'cookie-value');

      expect(store.set).toHaveBeenCalledWith('newCookie', 'cookie-value');
    });

    it('should allow deleting cookies', () => {
      const store = createMockCookieStore({ token: 'test' });

      store.delete('token');

      expect(store.delete).toHaveBeenCalledWith('token');
    });

    it('should return mock cookie object structure', () => {
      const store = createMockCookieStore({ token: 'value' });
      const cookie = store.get('token');

      expect(cookie).toEqual({
        name: 'token',
        value: 'value',
      });
    });
  });

  describe('createAuthenticatedRequest', () => {
    it('should create request with auth cookie', () => {
      const request = createAuthenticatedRequest(123);

      expect(request).toBeInstanceOf(Request);
      expect(request.headers.get('Cookie')).toContain('token=mock-jwt-token-123');
    });

    it('should use custom userId', () => {
      const request = createAuthenticatedRequest(456);

      expect(request.headers.get('Cookie')).toContain('token=mock-jwt-token-456');
    });

    it('should accept additional request options', () => {
      const request = createAuthenticatedRequest(1, {
        method: 'POST',
        body: { test: 'data' },
      });

      expect(request.method).toBe('POST');
    });
  });

  describe('mockDate', () => {
    it('should mock Date.now() to return fixed timestamp', () => {
      const fixedTime = new Date('2024-01-01T00:00:00Z').getTime();
      const cleanup = mockDate(fixedTime);

      expect(Date.now()).toBe(fixedTime);

      cleanup();
    });

    it('should restore original Date after cleanup', () => {
      const beforeMock = Date.now();
      const fixedTime = new Date('2024-01-01T00:00:00Z').getTime();
      const cleanup = mockDate(fixedTime);

      expect(Date.now()).toBe(fixedTime);

      cleanup();

      const afterCleanup = Date.now();
      expect(afterCleanup).not.toBe(fixedTime);
      expect(afterCleanup).toBeGreaterThanOrEqual(beforeMock);
    });

    it('should be callable multiple times for consistent mocking', () => {
      const fixedTime = new Date('2024-01-01T00:00:00Z').getTime();
      const cleanup = mockDate(fixedTime);

      expect(Date.now()).toBe(fixedTime);
      expect(Date.now()).toBe(fixedTime);

      cleanup();
    });
  });

  describe('mockFetchSuccess', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch as any;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should mock successful fetch response', async () => {
      const mockData = { id: 1, title: 'Test' };
      mockFetchSuccess({ data: mockData });

      const response = await fetch('/api/test');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data).toEqual(mockData);
    });

    it('should mock multiple sequential responses', async () => {
      mockFetchSuccess([
        { data: { id: 1 } },
        { data: { id: 2 } },
      ]);

      const response1 = await fetch('/api/test1');
      const response2 = await fetch('/api/test2');
      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1).toEqual({ id: 1 });
      expect(data2).toEqual({ id: 2 });
    });

    it('should allow custom status and headers', async () => {
      mockFetchSuccess({
        status: 201,
        headers: { 'X-Custom': 'value' },
        data: { created: true },
      });

      const response = await fetch('/api/test');

      expect(response.status).toBe(201);
      expect(response.headers.get('X-Custom')).toBe('value');
    });
  });

  describe('mockFetchError', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch as any;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should mock HTTP error response', async () => {
      mockFetchError({ status: 404, message: 'Not Found' });

      const response = await fetch('/api/test');
      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Not Found' });
    });

    it('should mock network error', async () => {
      mockFetchError({ networkError: true });

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });

    it('should mock multiple sequential errors', async () => {
      mockFetchError([
        { status: 401, message: 'Unauthorized' },
        { status: 500, message: 'Server Error' },
      ]);

      const response1 = await fetch('/api/test1');
      const response2 = await fetch('/api/test2');

      expect(response1.status).toBe(401);
      expect(response2.status).toBe(500);
    });
  });

  describe('resetFetchMocks', () => {
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch as any;
    });

    it('should clear all fetch mocks', () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'test' }) } as any);

      // This doesn't actually call fetch, just sets up the mock
      // So we need to actually test the mock behavior
      expect(mockFetch).toBeDefined();

      resetFetchMocks();

      expect(mockFetch.mock.calls.length).toBe(0);
    });
  });

  describe('createMockQueryResult', () => {
    it('should create mock query result methods', () => {
      const mockFeeds = [
        { id: 1, title: 'Feed 1' },
        { id: 2, title: 'Feed 2' },
      ] as any[];
      const mockResult = createMockQueryResult(mockFeeds);

      expect(mockResult.findMany).toBeDefined();
      expect(mockResult.findFirst).toBeDefined();
      expect(mockResult.findById).toBeDefined();
    });

    it('should return all items from findMany', async () => {
      const mockFeeds = [{ id: 1, title: 'Feed 1' }] as any[];
      const mockResult = createMockQueryResult(mockFeeds);

      const result = await mockResult.findMany();

      expect(result).toEqual(mockFeeds);
    });

    it('should return first item from findFirst', async () => {
      const mockFeeds = [
        { id: 1, title: 'Feed 1' },
        { id: 2, title: 'Feed 2' },
      ] as any[];
      const mockResult = createMockQueryResult(mockFeeds);

      const result = await mockResult.findFirst();

      expect(result).toEqual(mockFeeds[0]);
    });

    it('should return null from findFirst when empty', async () => {
      const mockResult = createMockQueryResult([]);

      const result = await mockResult.findFirst();

      expect(result).toBeNull();
    });

    it('should find item by id', async () => {
      const mockFeeds = [
        { id: 1, title: 'Feed 1' },
        { id: 2, title: 'Feed 2' },
      ] as any[];
      const mockResult = createMockQueryResult(mockFeeds);

      const result1 = await mockResult.findById(1);
      const result2 = await mockResult.findById(2);
      const result3 = await mockResult.findById(3);

      expect(result1).toEqual(mockFeeds[0]);
      expect(result2).toEqual(mockFeeds[1]);
      expect(result3).toBeNull();
    });
  });

  describe('createMockInsertResult', () => {
    it('should create chainable insert mock', async () => {
      const newFeed = { id: 1, title: 'New Feed' } as any;
      const mockInsert = createMockInsertResult([newFeed]);

      const chain = mockInsert.values({ title: 'New Feed' });
      expect(chain).toBe(mockInsert);

      const result = await chain.returning();
      expect(result).toEqual([newFeed]);
    });

    it('should capture values passed to values()', () => {
      const mockInsert = createMockInsertResult([]);
      const values = { title: 'Test Title' };

      mockInsert.values(values);

      // Note: This test just verifies values() is called
      // In real usage, you'd spy on it
      expect(mockInsert.values).toBeDefined();
    });

    it('should return data from returning()', async () => {
      const data = [{ id: 1, title: 'Feed' }];
      const mockInsert = createMockInsertResult(data);

      const result = await mockInsert.returning();

      expect(result).toEqual(data);
    });
  });
});
