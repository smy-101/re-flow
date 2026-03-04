import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import * as jwt from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock JWT module
vi.mock('@/lib/auth/jwt', () => ({
  getUserIdFromToken: vi.fn(),
}));

describe('getAuthenticatedUser', () => {
  let mockGetUserIdFromToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockGetUserIdFromToken = jwt.getUserIdFromToken as ReturnType<typeof vi.fn>;
  });

  it('should return user ID when valid token is provided', async () => {
    const mockUserId = 123;
    mockGetUserIdFromToken.mockResolvedValue(mockUserId);

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === 'token') {
          return { value: 'valid-token' };
        }
        return null;
      }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    const result = await getAuthenticatedUser();

    expect(result).toBe(mockUserId);
    expect(cookies).toHaveBeenCalled();
    expect(mockGetUserIdFromToken).toHaveBeenCalledWith('valid-token');
  });

  it('should return 401 response when token is missing', async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => null),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    const result = await getAuthenticatedUser();

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
      const json = await result.json();
      expect(json).toEqual({ error: 'Authentication required' });
    }
  });

  it('should return 401 response when token is invalid', async () => {
    mockGetUserIdFromToken.mockResolvedValue(null);

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === 'token') {
          return { value: 'invalid-token' };
        }
        return null;
      }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    const result = await getAuthenticatedUser();

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
      const json = await result.json();
      expect(json).toEqual({ error: 'Invalid token' });
    }
  });

  it('should return 401 response when JWT verification throws an error', async () => {
    mockGetUserIdFromToken.mockRejectedValue(new Error('JWT verification failed'));

    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) => {
        if (name === 'token') {
          return { value: 'malformed-token' };
        }
        return null;
      }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    const result = await getAuthenticatedUser();

    expect(result).toBeInstanceOf(NextResponse);
    if (result instanceof NextResponse) {
      expect(result.status).toBe(401);
      const json = await result.json();
      expect(json).toEqual({ error: 'Authentication failed' });
    }
  });
});
