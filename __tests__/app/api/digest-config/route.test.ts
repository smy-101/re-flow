import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
      emailDigestConfigs: {
        findFirst: vi.fn(),
      },
      emailDigestFilters: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/auth/auth-helper', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/digest/scheduler', () => ({
  calculateNextSendAt: vi.fn(),
}));

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { calculateNextSendAt } from '@/lib/digest/scheduler';
import { GET, PUT, DELETE } from '@/app/api/digest-config/route';

const FIXED_NOW_MS = 1773017838344;
const FIXED_NOW_SECONDS = 1773017838;

const mockDb = db as unknown as {
  query: {
    users: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    emailDigestConfigs: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    emailDigestFilters: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};
const mockGetAuthenticatedUser = vi.mocked(getAuthenticatedUser);
const mockCalculateNextSendAt = vi.mocked(calculateNextSendAt);

function createJsonRequest(url: string, method: 'PUT', body: Record<string, unknown>): NextRequest {
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

  return {
    chain,
    set,
  };
}

function createInsertChain(returningValue?: unknown) {
  const chain = {
    returning: vi.fn(async () => returningValue),
  };

  const values = vi.fn(() => chain);

  return {
    chain,
    values,
  };
}

describe('Digest Config API - GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS);
    mockGetAuthenticatedUser.mockResolvedValue(1);
  });

  it('returns default config when no config exists', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: true,
      passwordHash: 'hash',
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue(undefined);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.enabled).toBe(false);
    expect(data.frequency).toBe('daily');
    expect(data.sendTime).toBe('08:00');
    expect(data.timezone).toBe('UTC');
    expect(data.filters).toEqual([]);
    expect(data.emailVerified).toBe(true);
  });

  it('returns existing config with filters', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: true,
      passwordHash: 'hash',
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      enabled: true,
      frequency: 'daily',
      customDays: null,
      sendTime: '09:00',
      timezone: 'Asia/Shanghai',
      markAsRead: true,
      pausedDueToFailures: false,
      consecutiveFailures: 0,
      lastSentAt: null,
      nextSendAt: FIXED_NOW_SECONDS + 3600,
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.query.emailDigestFilters.findMany.mockResolvedValue([
      { id: 1, configId: 1, filterType: 'category', filterValue: 'tech' },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.enabled).toBe(true);
    expect(data.frequency).toBe('daily');
    expect(data.sendTime).toBe('09:00');
    expect(data.timezone).toBe('Asia/Shanghai');
    expect(data.filters).toHaveLength(1);
    expect(data.filters[0].filterType).toBe('category');
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const response = await GET();

    expect(response.status).toBe(401);
  });
});

describe('Digest Config API - PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS);
    mockGetAuthenticatedUser.mockResolvedValue(1);
    mockCalculateNextSendAt.mockReturnValue(FIXED_NOW_SECONDS + 86400);
  });

  it('creates new config with valid data', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: true,
      passwordHash: 'hash',
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    // First call: check existing config (returns undefined - no existing config)
    // Second call: fetch created config (returns the new config)
    mockDb.query.emailDigestConfigs.findFirst
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        id: 1,
        userId: 1,
        enabled: true,
        frequency: 'daily',
        customDays: null,
        sendTime: '08:00',
        timezone: 'UTC',
        markAsRead: false,
        pausedDueToFailures: false,
        consecutiveFailures: 0,
        lastSentAt: null,
        nextSendAt: FIXED_NOW_SECONDS + 86400,
        createdAt: FIXED_NOW_SECONDS,
        updatedAt: FIXED_NOW_SECONDS,
      });

    const insertChain = createInsertChain([{ id: 1 }]);
    const filterInsertChain = createInsertChain([{}]);
    let insertCallCount = 0;
    mockDb.insert = vi.fn(() => {
      insertCallCount++;
      if (insertCallCount === 1) {
        return { values: insertChain.values };
      }
      return { values: filterInsertChain.values };
    });

    mockDb.query.emailDigestFilters.findMany.mockResolvedValue([]);

    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: true,
      frequency: 'daily',
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.enabled).toBe(true);
    expect(mockCalculateNextSendAt).toHaveBeenCalled();
  });

  it('rejects invalid frequency', async () => {
    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: false,
      frequency: 'invalid',
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid frequency');
  });

  it('rejects custom frequency without customDays', async () => {
    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: false,
      frequency: 'custom',
      customDays: null,
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('customDays must be between 1 and 30');
  });

  it('rejects custom frequency with customDays out of range', async () => {
    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: false,
      frequency: 'custom',
      customDays: 31,
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('customDays must be between 1 and 30');
  });

  it('rejects invalid sendTime format', async () => {
    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: false,
      frequency: 'daily',
      sendTime: '8:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('sendTime must be in HH:mm format');
  });

  it('rejects enabling without verified email', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: false,
      passwordHash: 'hash',
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });

    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: true,
      frequency: 'daily',
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Email must be verified');
  });

  it('allows creating disabled config without verified email', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: false,
      passwordHash: 'hash',
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    // First call: check existing config (returns undefined)
    // Second call: fetch created config (returns the new config)
    mockDb.query.emailDigestConfigs.findFirst
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        id: 1,
        userId: 1,
        enabled: false,
        frequency: 'daily',
        customDays: null,
        sendTime: '08:00',
        timezone: 'UTC',
        markAsRead: false,
        pausedDueToFailures: false,
        consecutiveFailures: 0,
        lastSentAt: null,
        nextSendAt: null,
        createdAt: FIXED_NOW_SECONDS,
        updatedAt: FIXED_NOW_SECONDS,
      });

    const insertChain = createInsertChain([{ id: 1 }]);
    const filterInsertChain = createInsertChain([{}]);
    let insertCallCount = 0;
    mockDb.insert = vi.fn(() => {
      insertCallCount++;
      if (insertCallCount === 1) {
        return { values: insertChain.values };
      }
      return { values: filterInsertChain.values };
    });

    mockDb.query.emailDigestFilters.findMany.mockResolvedValue([]);

    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: false,
      frequency: 'daily',
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(mockCalculateNextSendAt).not.toHaveBeenCalled();
  });

  it('updates existing config and replaces filters', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: true,
      passwordHash: 'hash',
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      enabled: false,
      frequency: 'daily',
      customDays: null,
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      pausedDueToFailures: false,
      consecutiveFailures: 0,
      lastSentAt: null,
      nextSendAt: null,
      createdAt: FIXED_NOW_SECONDS - 1000,
      updatedAt: FIXED_NOW_SECONDS - 1000,
    });

    const updateChain = createUpdateChain([{ id: 1 }]);
    mockDb.update = vi.fn(() => ({ set: updateChain.set }));
    mockDb.delete = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
    mockDb.insert = vi.fn(() => ({ values: vi.fn(async () => {}) }));

    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      enabled: true,
      frequency: 'daily',
      customDays: null,
      sendTime: '09:00',
      timezone: 'Asia/Shanghai',
      markAsRead: true,
      pausedDueToFailures: false,
      consecutiveFailures: 0,
      lastSentAt: null,
      nextSendAt: FIXED_NOW_SECONDS + 86400,
      createdAt: FIXED_NOW_SECONDS - 1000,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.query.emailDigestFilters.findMany.mockResolvedValue([
      { id: 2, configId: 1, filterType: 'feed', filterValue: '5' },
    ]);

    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: true,
      frequency: 'daily',
      sendTime: '09:00',
      timezone: 'Asia/Shanghai',
      markAsRead: true,
      filters: [{ filterType: 'feed', filterValue: '5' }],
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.enabled).toBe(true);
    expect(data.sendTime).toBe('09:00');
  });

  it('resets failure state when re-enabling', async () => {
    mockDb.query.users.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      emailVerified: true,
      passwordHash: 'hash',
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      enabled: false,
      frequency: 'daily',
      customDays: null,
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      pausedDueToFailures: true,
      consecutiveFailures: 3,
      lastSentAt: null,
      nextSendAt: null,
      createdAt: FIXED_NOW_SECONDS - 1000,
      updatedAt: FIXED_NOW_SECONDS - 1000,
    });

    const updateChain = createUpdateChain([{ id: 1 }]);
    mockDb.update = vi.fn(() => ({ set: updateChain.set }));
    mockDb.delete = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
    mockDb.insert = vi.fn(() => ({ values: vi.fn(async () => {}) }));

    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      enabled: true,
      frequency: 'daily',
      customDays: null,
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      pausedDueToFailures: false,
      consecutiveFailures: 0,
      lastSentAt: null,
      nextSendAt: FIXED_NOW_SECONDS + 86400,
      createdAt: FIXED_NOW_SECONDS - 1000,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.query.emailDigestFilters.findMany.mockResolvedValue([]);

    const request = createJsonRequest('http://localhost/api/digest-config', 'PUT', {
      enabled: true,
      frequency: 'daily',
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      filters: [],
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        pausedDueToFailures: false,
        consecutiveFailures: 0,
      })
    );
  });
});

describe('Digest Config API - DELETE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS);
    mockGetAuthenticatedUser.mockResolvedValue(1);
  });

  it('deletes existing config', async () => {
    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      enabled: true,
      frequency: 'daily',
      customDays: null,
      sendTime: '08:00',
      timezone: 'UTC',
      markAsRead: false,
      pausedDueToFailures: false,
      consecutiveFailures: 0,
      lastSentAt: null,
      nextSendAt: FIXED_NOW_SECONDS + 86400,
      createdAt: FIXED_NOW_SECONDS,
      updatedAt: FIXED_NOW_SECONDS,
    });
    mockDb.delete = vi.fn(() => ({ where: vi.fn(async () => undefined) }));

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDb.delete).toHaveBeenCalledTimes(2);
  });

  it('returns 404 when no config exists', async () => {
    mockDb.query.emailDigestConfigs.findFirst.mockResolvedValue(undefined);

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No digest config found');
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAuthenticatedUser.mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

    const response = await DELETE();

    expect(response.status).toBe(401);
  });
});
