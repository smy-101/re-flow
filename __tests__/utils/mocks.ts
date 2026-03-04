/**
 * Mock helper functions for Next.js requests and responses
 *
 * These functions simplify mocking Next.js specific objects in tests.
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { vi } from 'vitest';

/**
 * Creates a mock NextRequest object
 * @param options - Request configuration options
 * @returns A mock NextRequest object
 *
 * @example
 * ```ts
 * const request = createMockRequest({
 *   method: 'POST',
 *   body: { foo: 'bar' },
 *   headers: { 'x-custom-header': 'value' },
 * });
 * ```
 */
export function createMockRequest(options: {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url?: string;
  body?: Record<string, unknown> | string;
  headers?: Record<string, string>;
} = {}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    body,
    headers = {},
  } = options;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const request = new Request(url, requestInit) as unknown as NextRequest;

  return request;
}

/**
 * Creates a mock cookie store simulating Next.js cookies() API
 * @param initialCookies - Initial cookies to populate the store
 * @returns A mock cookie store object
 *
 * @example
 * ```ts
 * const mockCookies = createMockCookieStore({
 *   'token': 'mock-jwt-token',
 *   'theme': 'dark',
 * });
 *
 * // Or empty for testing no cookies
 * const emptyCookies = createMockCookieStore();
 * ```
 */
export function createMockCookieStore(
  initialCookies: Record<string, string> = {}
) {
  const store = {
    _cookies: new Map(Object.entries(initialCookies)),

    get: vi.fn((name: string) => {
      const value = store._cookies.get(name);
      return value ? { name, value } : undefined;
    }),

    set: vi.fn((name: string, value: string) => {
      store._cookies.set(name, value);
    }),

    delete: vi.fn((name: string) => {
      store._cookies.delete(name);
    }),
  };

  return store;
}

/**
 * Creates an authenticated request mock with valid JWT token
 * @param userId - User ID to embed in the mock token
 * @param options - Additional request options
 * @returns A mock NextRequest with authentication cookies
 *
 * @example
 * ```ts
 * const authenticatedRequest = createAuthenticatedRequest(123, {
 *   method: 'POST',
 *   url: 'http://localhost:3000/api/feeds',
 *   body: { feedUrl: 'https://example.com/feed.xml' },
 * });
 * ```
 */
export function createAuthenticatedRequest(
  userId: number | string = 1,
  options: Omit<Parameters<typeof createMockRequest>[0], 'headers'> = {}
): NextRequest {
  const mockToken = `mock-jwt-token-${userId}`;

  return createMockRequest({
    ...options,
    headers: {
      Cookie: `token=${mockToken}`,
    },
  });
}

/**
 * Mocks JWT authentication utilities for testing
 * @param options - Mock configuration
 *
 * @example
 * ```ts
 * // Mock successful authentication
 * mockJWT({ userId: 123 });
 *
 * // Mock failed authentication
 * mockJWT({ userId: null });
 *
 * // Mock with custom token
 * mockJWT({ userId: 456, token: 'custom-token' });
 * ```
 */
export function mockJWT(options: {
  userId: number | null;
  token?: string;
} = { userId: 1 }) {
  const { userId } = options;

  const signToken = vi.fn(async (id: number) => `mock-jwt-token-${id}`);
  const verifyToken = vi.fn(async () => {
    if (userId === null) return null;
    return {
      sub: String(userId),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };
  });
  const getUserIdFromToken = vi.fn(async () => userId);

  vi.doMock('@/lib/auth/jwt', () => ({
    signToken,
    verifyToken,
    getUserIdFromToken,
  }));

  return {
    signToken,
    verifyToken,
    getUserIdFromToken,
  };
}

/**
 * Mocks Date.now() and related time functions
 * @param timestamp - Fixed timestamp to return (in milliseconds)
 * @returns Cleanup function to restore original Date
 *
 * @example
 * ```ts
 * const cleanup = mockDate(new Date('2024-01-01').getTime());
 * // All Date.now() calls return '2024-01-01' timestamp
 *
 * // Later
 * cleanup();
 * ```
 */
export function mockDate(timestamp: number): () => void {
  const spy = vi.spyOn(Date, 'now').mockReturnValue(timestamp);

  // Note: In jsdom environment, we can't easily mock the Date constructor
  // This mock primarily affects Date.now() which is used in most code

  return () => {
    spy.mockRestore();
  };
}

/**
 * Mocks fetch API responses
 * @param responses - Array of mock responses or single response
 *
 * @example
 * ```ts
 * // Mock successful fetch
 * mockFetchSuccess({ data: { id: 1, title: 'Test' } });
 *
 * // Mock multiple sequential calls
 * mockFetchSuccess([
 *   { data: { id: 1 } },
 *   { data: { id: 2 } },
 * ]);
 *
 * // With status and headers
 * mockFetchSuccess({
 *   status: 201,
 *   headers: { 'X-Custom': 'value' },
 *   data: { created: true },
 * });
 * ```
 */
export function mockFetchSuccess(
  responses:
    | {
        data: unknown;
        status?: number;
        headers?: Record<string, string>;
      }
    | {
        data: unknown;
        status?: number;
        headers?: Record<string, string>;
      }[]
) {
  const responseArray = Array.isArray(responses) ? responses : [responses];

  let callCount = 0;
  vi.mocked(global.fetch).mockImplementation(async (input: RequestInfo | URL) => {
    const response = responseArray[Math.min(callCount, responseArray.length - 1)];
    callCount++;

    return {
      ok: true,
      status: response.status || 200,
      headers: new Headers(response.headers || {}),
      json: async () => response.data,
      text: async () => JSON.stringify(response.data),
    } as Response;
  });
}

/**
 * Mocks fetch API errors
 * @param errors - Error configuration
 *
 * @example
 * ```ts
 * // Mock HTTP error
 * mockFetchError({ status: 404, message: 'Not Found' });
 *
 * // Mock network error
 * mockFetchError({ networkError: true });
 *
 * // Mock multiple errors
 * mockFetchError([
 *   { status: 401, message: 'Unauthorized' },
 *   { status: 500, message: 'Server Error' },
 * ]);
 * ```
 */
export function mockFetchError(
  errors:
    | {
        status?: number;
        message?: string;
        networkError?: boolean;
      }
    | {
        status?: number;
        message?: string;
        networkError?: boolean;
      }[] = []
) {
  const errorArray = Array.isArray(errors) ? errors : [errors];

  let callCount = 0;
  vi.mocked(global.fetch).mockImplementation(async () => {
    const error = errorArray[Math.min(callCount, errorArray.length - 1)];
    callCount++;

    if (error.networkError) {
      throw new Error('Network error');
    }

    return {
      ok: false,
      status: error.status || 500,
      json: async () => ({ error: error.message || 'Request failed' }),
      text: async () => error.message || 'Request failed',
    } as Response;
  });
}

/**
 * Resets all fetch mocks to initial state
 * Call this in beforeEach() to ensure clean state between tests
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   resetFetchMocks();
 *   // Set up fresh mocks for this test
 * });
 * ```
 */
export function resetFetchMocks() {
  vi.mocked(global.fetch).mockClear();
}

/**
 * Creates a mock database query result
 * @param data - Data to return from the query
 * @returns A mock query result object
 *
 * @example
 * ```ts
 * const mockFeeds = createMockFeeds(3);
 * vi.mocked(db.query.feeds.findMany).mockResolvedValue(createMockQueryResult(mockFeeds));
 * ```
 */
export function createMockQueryResult<T>(data: T[]) {
  return {
    findMany: vi.fn().mockResolvedValue(data),
    findFirst: vi.fn().mockResolvedValue(data[0] || null),
    findById: vi.fn((id: number) => {
      const found = data.find((item) => (item as any).id === id);
      return Promise.resolve(found || null);
    }),
  };
}

/**
 * Creates a mock database insert result
 * @param data - Data to return from insertion
 * @returns A mock insert chainable object
 *
 * @example
 * ```ts
 * const newFeed = createMockFeed();
 * vi.mocked(db.insert).mockReturnValue(createMockInsertResult([newFeed]));
 * ```
 */
export function createMockInsertResult<T>(data: T[]) {
  let mockValues = {};
  const insertChain = {
    values: vi.fn(function(this: any, values: any) {
      mockValues = values;
      return this;
    }),
    returning: vi.fn(function() {
      return Promise.resolve(data);
    }),
  };

  return insertChain as any;
}
