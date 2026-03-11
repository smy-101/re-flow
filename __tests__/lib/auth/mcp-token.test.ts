import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveMCPTokenCallerContext, MCPTokenAuthError } from '@/lib/auth/mcp-token';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      mcpTokens: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
  },
}));

describe('lib/auth/mcp-token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveMCPTokenCallerContext', () => {
    it('rejects unknown token secrets', async () => {
      vi.mocked(db.query.mcpTokens.findFirst).mockResolvedValue(null as never);

      await expect(resolveMCPTokenCallerContext('mcp_test_secret')).rejects.toMatchObject({
        code: 'invalid_token',
      } satisfies Partial<MCPTokenAuthError>);
    });

    it('rejects disabled tokens before exposing caller context', async () => {
      vi.mocked(db.query.mcpTokens.findFirst).mockResolvedValue({
        id: 9,
        userId: 4,
        name: 'Desktop Client',
        tokenPrefix: 'mcp_live',
        tokenHash: 'hashed-secret',
        feedWhitelist: '[1,2,3]',
        timeWindowDays: 14,
        allowRawFallback: true,
        isEnabled: false,
        lastUsedAt: null,
        createdAt: 1,
        updatedAt: 1,
      });

      await expect(resolveMCPTokenCallerContext('mcp_test_secret')).rejects.toMatchObject({
        code: 'token_disabled',
      } satisfies Partial<MCPTokenAuthError>);
    });

    it('rejects tokens whose persisted scope payload is malformed', async () => {
      vi.mocked(db.query.mcpTokens.findFirst).mockResolvedValue({
        id: 11,
        userId: 7,
        name: 'Broken Scope Token',
        tokenPrefix: 'mcp_live',
        tokenHash: 'hashed-secret',
        feedWhitelist: '{bad json}',
        timeWindowDays: 7,
        allowRawFallback: true,
        isEnabled: true,
        lastUsedAt: null,
        createdAt: 1,
        updatedAt: 1,
      });

      await expect(resolveMCPTokenCallerContext('mcp_test_secret')).rejects.toMatchObject({
        code: 'invalid_scope',
      } satisfies Partial<MCPTokenAuthError>);
    });
  });
});
