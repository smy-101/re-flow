import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      aiConfigs: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      craftTemplates: {
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

vi.mock('@/lib/auth/encryption', () => ({
  encrypt: vi.fn(),
  decrypt: vi.fn(),
}));

vi.mock('@/lib/ai/providers', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai/providers')>('@/lib/ai/providers');
  return {
    ...actual,
    maskApiKey: vi.fn((apiKey: string) => `masked:${apiKey}`),
  };
});

vi.mock('@/lib/ai/test', () => ({
  testAIConfig: vi.fn(),
}));

import { db } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { encrypt, decrypt } from '@/lib/auth/encryption';
import { testAIConfig } from '@/lib/ai/test';
import { POST as createAIConfigRoute } from '@/app/api/ai-configs/route';
import { PUT as updateAIConfigRoute } from '@/app/api/ai-configs/[id]/route';
import { POST as testAIConfigRoute } from '@/app/api/ai-configs/[id]/test/route';

const FIXED_NOW_MS = 1773017838344;
const FIXED_NOW_SECONDS = 1773017838;

const mockDb = db as unknown as {
  query: {
    aiConfigs: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
    };
    craftTemplates: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};
const mockGetAuthenticatedUser = vi.mocked(getAuthenticatedUser);
const mockEncrypt = vi.mocked(encrypt);
const mockDecrypt = vi.mocked(decrypt);
const mockTestAIConfig = vi.mocked(testAIConfig);

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

describe('AI config timestamp routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW_MS);
    mockGetAuthenticatedUser.mockResolvedValue(1);
  });

  it('creates AI configs with second-based timestamps', async () => {
    const insertChain = createInsertChain([
      {
        id: 1,
        userId: 1,
        name: 'Test Config',
        providerType: 'openai',
        providerId: 'openai',
        apiFormat: 'openai',
        baseURL: 'https://api.openai.com/v1',
        apiKeyEncrypted: 'encrypted-key',
        apiKeyIv: 'iv',
        apiKeyTag: 'tag',
        model: 'gpt-4o-mini',
        systemPrompt: null,
        modelParams: null,
        isDefault: false,
        isEnabled: true,
        healthStatus: 'unverified',
        lastError: null,
        lastErrorAt: null,
        extraParams: null,
        createdAt: FIXED_NOW_SECONDS,
        updatedAt: FIXED_NOW_SECONDS,
      },
    ]);

    mockDb.insert = vi.fn(() => ({ values: insertChain.values }));
    mockDb.update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(async () => undefined) })) }));
    mockEncrypt.mockReturnValue({ encrypted: 'encrypted-key', iv: 'iv', tag: 'tag' });

    const request = createJsonRequest('http://localhost/api/ai-configs', 'POST', {
      name: 'Test Config',
      providerType: 'openai',
      providerId: 'openai',
      apiFormat: 'openai',
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'sk-test-key',
      model: 'gpt-4o-mini',
    });

    const response = await createAIConfigRoute(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: FIXED_NOW_SECONDS,
        updatedAt: FIXED_NOW_SECONDS,
      }),
    );
    expect(data.createdAt).toBe(FIXED_NOW_SECONDS);
    expect(data.updatedAt).toBe(FIXED_NOW_SECONDS);
  });

  it('updates AI configs with second-based updatedAt', async () => {
    const updateChain = createUpdateChain([
      {
        id: 1,
        userId: 1,
        name: 'Updated Config',
        providerType: 'openai',
        providerId: 'openai',
        apiFormat: 'openai',
        baseURL: 'https://api.openai.com/v1',
        apiKeyEncrypted: 'encrypted-key',
        apiKeyIv: 'iv',
        apiKeyTag: 'tag',
        model: 'gpt-4o-mini',
        systemPrompt: null,
        modelParams: null,
        isDefault: false,
        isEnabled: true,
        healthStatus: 'unverified',
        lastError: null,
        lastErrorAt: null,
        extraParams: null,
        createdAt: 1773017000,
        updatedAt: FIXED_NOW_SECONDS,
      },
    ]);

    mockDb.query.aiConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      name: 'Test Config',
      providerType: 'openai',
      providerId: 'openai',
      apiFormat: 'openai',
      baseURL: 'https://api.openai.com/v1',
      apiKeyEncrypted: 'encrypted-key',
      apiKeyIv: 'iv',
      apiKeyTag: 'tag',
      model: 'gpt-4o-mini',
      systemPrompt: null,
      modelParams: null,
      isDefault: false,
      isEnabled: true,
      healthStatus: 'active',
      lastError: 'old error',
      lastErrorAt: 1773016000,
      extraParams: null,
      createdAt: 1773015000,
      updatedAt: 1773016000,
    });
    mockDb.update = vi.fn(() => ({ set: updateChain.set }));

    const request = createJsonRequest('http://localhost/api/ai-configs/1', 'PUT', {
      name: 'Updated Config',
    });

    const response = await updateAIConfigRoute(request, {
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

  it('records AI config test failure timestamps in seconds', async () => {
    const updateChain = createUpdateChain(undefined);

    mockDb.query.aiConfigs.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      name: 'Test Config',
      providerType: 'openai',
      providerId: 'openai',
      apiFormat: 'openai',
      baseURL: 'https://api.openai.com/v1',
      apiKeyEncrypted: 'encrypted-key',
      apiKeyIv: 'iv',
      apiKeyTag: 'tag',
      model: 'gpt-4o-mini',
      systemPrompt: null,
      modelParams: null,
      isDefault: false,
      isEnabled: true,
      healthStatus: 'unverified',
      lastError: null,
      lastErrorAt: null,
      extraParams: null,
      createdAt: 1773015000,
      updatedAt: 1773016000,
    });
    mockDb.update = vi.fn(() => ({ set: updateChain.set }));
    mockDecrypt.mockReturnValue('sk-test-key');
    mockTestAIConfig.mockResolvedValue({ success: false, error: 'boom' });

    const request = createJsonRequest('http://localhost/api/ai-configs/1/test', 'POST', {});

    const response = await testAIConfigRoute(request, {
      params: Promise.resolve({ id: '1' }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({
        lastErrorAt: FIXED_NOW_SECONDS,
        updatedAt: FIXED_NOW_SECONDS,
      }),
    );
    expect(data.success).toBe(false);
  });
});
