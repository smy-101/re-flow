import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/queue/add/route';

// Mock dependencies
vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: vi.fn(),
}));

vi.mock('@/lib/processing/queue', () => ({
  addToQueue: vi.fn(),
}));

import { verifyToken } from '@/lib/auth/jwt';
import { addToQueue } from '@/lib/processing/queue';

const mockVerifyToken = vi.mocked(verifyToken);
const mockAddToQueue = vi.mocked(addToQueue);

// Helper to create valid JWT payload
function createMockJWTPayload(sub: string = '1') {
  return {
    sub,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  };
}

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/queue/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function createRequestWithCookie(body: Record<string, unknown>, token?: string): NextRequest {
  const request = createRequest(body);
  if (token) {
    request.cookies.set('token', token);
  }
  return request;
}

describe('POST /api/queue/add', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when no token is provided', async () => {
      const request = createRequestWithCookie({ feedItemId: 1, templateId: 1 });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when token is invalid', async () => {
      mockVerifyToken.mockResolvedValueOnce(null);
      const request = createRequestWithCookie({ feedItemId: 1, templateId: 1 }, 'invalid-token');

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Parameter Validation', () => {
    it('should return 400 when feedItemId is missing', async () => {
      mockVerifyToken.mockResolvedValueOnce(createMockJWTPayload());
      const request = createRequestWithCookie({ templateId: 1 }, 'valid-token');

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('请选择要处理的文章');
    });

    it('should return 400 when neither templateId nor pipelineId is provided', async () => {
      mockVerifyToken.mockResolvedValueOnce(createMockJWTPayload());
      const request = createRequestWithCookie({ feedItemId: 1 }, 'valid-token');

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('请选择模板或管道');
    });

    it('should return 400 when both templateId and pipelineId are provided', async () => {
      mockVerifyToken.mockResolvedValueOnce(createMockJWTPayload());
      const request = createRequestWithCookie(
        { feedItemId: 1, templateId: 1, pipelineId: 1 },
        'valid-token',
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('只能选择模板或管道其中之一');
    });
  });

  describe('Successful Queue Operations', () => {
    it('should add to queue with templateId and return success', async () => {
      mockVerifyToken.mockResolvedValueOnce(createMockJWTPayload());
      const mockJob = {
        id: 123,
        userId: 1,
        feedItemId: 1,
        templateId: 1,
        pipelineId: null,
        status: 'pending',
        priority: 0,
        attempts: 0,
        maxAttempts: 3,
        errorMessage: null,
        createdAt: Math.floor(Date.now() / 1000),
        startedAt: null,
        completedAt: null,
      };
      mockAddToQueue.mockResolvedValueOnce(mockJob);

      const request = createRequestWithCookie(
        { feedItemId: 1, templateId: 1 },
        'valid-token',
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobId).toBe(123);
      expect(data.isNew).toBe(true);
      expect(mockAddToQueue).toHaveBeenCalledWith({
        userId: 1,
        feedItemId: 1,
        templateId: 1,
        pipelineId: null,
      });
    });

    it('should add to queue with pipelineId and return success', async () => {
      mockVerifyToken.mockResolvedValueOnce(createMockJWTPayload());
      const mockJob = {
        id: 124,
        userId: 1,
        feedItemId: 2,
        templateId: null,
        pipelineId: 1,
        status: 'pending',
        priority: 0,
        attempts: 0,
        maxAttempts: 3,
        errorMessage: null,
        createdAt: Math.floor(Date.now() / 1000),
        startedAt: null,
        completedAt: null,
      };
      mockAddToQueue.mockResolvedValueOnce(mockJob);

      const request = createRequestWithCookie(
        { feedItemId: 2, pipelineId: 1 },
        'valid-token',
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobId).toBe(124);
      expect(data.isNew).toBe(true);
      expect(mockAddToQueue).toHaveBeenCalledWith({
        userId: 1,
        feedItemId: 2,
        templateId: null,
        pipelineId: 1,
      });
    });
  });

  describe('Duplicate Queue Handling', () => {
    it('should return existing job info when item is already in queue (pending)', async () => {
      mockVerifyToken.mockResolvedValueOnce(createMockJWTPayload());
      const existingJob = {
        id: 100,
        userId: 1,
        feedItemId: 1,
        templateId: 1,
        pipelineId: null,
        status: 'pending',
        priority: 0,
        attempts: 0,
        maxAttempts: 3,
        errorMessage: null,
        createdAt: Math.floor(Date.now() / 1000) - 60,
        startedAt: null,
        completedAt: null,
      };
      mockAddToQueue.mockResolvedValueOnce(existingJob);

      const request = createRequestWithCookie(
        { feedItemId: 1, templateId: 1 },
        'valid-token',
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobId).toBe(100);
      expect(data.isNew).toBe(false);
    });

    it('should return existing job info when item is already in queue (processing)', async () => {
      mockVerifyToken.mockResolvedValueOnce(createMockJWTPayload());
      const existingJob = {
        id: 101,
        userId: 1,
        feedItemId: 1,
        templateId: 1,
        pipelineId: null,
        status: 'processing',
        priority: 0,
        attempts: 0,
        maxAttempts: 3,
        errorMessage: null,
        createdAt: Math.floor(Date.now() / 1000) - 120,
        startedAt: Math.floor(Date.now() / 1000) - 60,
        completedAt: null,
      };
      mockAddToQueue.mockResolvedValueOnce(existingJob);

      const request = createRequestWithCookie(
        { feedItemId: 1, templateId: 1 },
        'valid-token',
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.jobId).toBe(101);
      expect(data.isNew).toBe(false);
    });
  });
});
