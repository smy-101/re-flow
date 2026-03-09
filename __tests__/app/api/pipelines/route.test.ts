import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      pipelines: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/auth/auth-helper', () => ({
  getAuthenticatedUser: vi.fn(),
}));

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { POST as createPipelineRoute } from '@/app/api/pipelines/route';
import { PUT as updatePipelineRoute } from '@/app/api/pipelines/[id]/route';

const FIXED_NOW_MS = 1773017838344;
const FIXED_NOW_SECONDS = 1773017838;

const mockDb = db as unknown as {
  query: {
    pipelines: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};
const mockGetAuthenticatedUser = vi.mocked(getAuthenticatedUser);

function createJsonRequest(url: string, method: 'POST' | 'PUT', body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function createUpdateChain(returningValue?: unknown) {
  const chain = {
    where: vi.fn(() => chain),
    returning: vi.fn(async () => returningValue),
  };

  const set = vi.fn(() => chain);

  return { set };
}

function createInsertChain(returningValue?: unknown) {
  const chain = {
    returning: vi.fn(async () => returningValue),
  };

  const values = vi.fn(() => chain);

  return { values };
}

describe('Pipeline timestamp routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS);
    mockGetAuthenticatedUser.mockResolvedValue(1);
  });

  it('creates pipelines with second-based timestamps', async () => {
    const insertChain = createInsertChain([
      {
        id: 1,
        userId: 1,
        name: 'Pipeline',
        description: null,
        steps: JSON.stringify([{ templateId: 1, order: 0, name: 'Step 1' }]),
        createdAt: FIXED_NOW_SECONDS,
        updatedAt: FIXED_NOW_SECONDS,
      },
    ]);

    mockDb.insert = vi.fn(() => ({ values: insertChain.values }));

    const request = createJsonRequest('http://localhost/api/pipelines', 'POST', {
      name: 'Pipeline',
      steps: [{ templateId: 1, order: 0, name: 'Step 1' }],
    });

    const response = await createPipelineRoute(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: FIXED_NOW_SECONDS,
        updatedAt: FIXED_NOW_SECONDS,
      }),
    );
    expect(data.createdAt).toBe(FIXED_NOW_SECONDS);
  });

  it('updates pipelines with second-based updatedAt', async () => {
    const updateChain = createUpdateChain([
      {
        id: 1,
        userId: 1,
        name: 'Updated Pipeline',
        description: null,
        steps: JSON.stringify([{ templateId: 1, order: 0, name: 'Step 1' }]),
        createdAt: 1773017000,
        updatedAt: FIXED_NOW_SECONDS,
      },
    ]);

    mockDb.query.pipelines.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      name: 'Pipeline',
      description: null,
      steps: JSON.stringify([{ templateId: 1, order: 0, name: 'Step 1' }]),
      createdAt: 1773017000,
      updatedAt: 1773017100,
    });
    mockDb.update = vi.fn(() => ({ set: updateChain.set }));

    const request = createJsonRequest('http://localhost/api/pipelines/1', 'PUT', {
      name: 'Updated Pipeline',
    });

    const response = await updatePipelineRoute(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        updatedAt: FIXED_NOW_SECONDS,
      }),
    );
    expect(data.updatedAt).toBe(FIXED_NOW_SECONDS);
  });
});
