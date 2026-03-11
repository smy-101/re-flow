import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMCPToken,
  deleteMCPToken,
  getMCPToken,
  getMCPTokens,
  toggleMCPToken,
} from '@/lib/api/mcp-tokens';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('lib/api/mcp-tokens', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('lists MCP tokens for the current user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tokens: [{ id: 1, name: 'Desktop Client' }] }),
    });

    const result = await getMCPTokens();

    expect(mockFetch).toHaveBeenCalledWith('/api/mcp-tokens', {
      method: 'GET',
      credentials: 'include',
    });
    expect(result).toEqual([{ id: 1, name: 'Desktop Client' }]);
  });

  it('throws on failed token creation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: '名称不能为空' }),
    });

    await expect(createMCPToken({ name: '' })).rejects.toThrow('名称不能为空');
  });

  it('loads a single token detail', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, name: 'Claude Desktop' }),
    });

    const result = await getMCPToken(2);
    expect(result).toEqual({ id: 2, name: 'Claude Desktop' });
  });

  it('toggles token enabled state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, isEnabled: false }),
    });

    const result = await toggleMCPToken(2);
    expect(mockFetch).toHaveBeenCalledWith('/api/mcp-tokens/2', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ action: 'toggle' }),
    });
    expect(result.isEnabled).toBe(false);
  });

  it('deletes a token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(deleteMCPToken(5)).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith('/api/mcp-tokens/5', {
      method: 'DELETE',
      credentials: 'include',
    });
  });
});
