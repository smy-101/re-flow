export interface MCPTokenScopeConfig {
  feedIds: number[] | null;
  timeWindowDays: number | null;
  allowRawFallback: boolean;
}

export interface MCPTokenRecord {
  id: number;
  name: string;
  tokenPrefix: string;
  isEnabled: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  scope: MCPTokenScopeConfig;
}

export interface MCPTokenWithSecret extends MCPTokenRecord {
  secret: string;
}

export interface CreateMCPTokenRequest {
  name: string;
  feedIds?: number[] | null;
  timeWindowDays?: number | null;
  allowRawFallback?: boolean;
}

interface APIError {
  error: string;
}

async function handleAPIResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = (await response.json().catch(() => ({ error: 'Request failed' }))) as APIError;
    throw new Error(data.error || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function getMCPTokens(): Promise<MCPTokenRecord[]> {
  const response = await fetch('/api/mcp-tokens', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await handleAPIResponse<{ tokens: MCPTokenRecord[] }>(response);
  return data.tokens;
}

export async function createMCPToken(
  input: CreateMCPTokenRequest,
): Promise<MCPTokenWithSecret> {
  const response = await fetch('/api/mcp-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return handleAPIResponse<MCPTokenWithSecret>(response);
}

export async function getMCPToken(id: number): Promise<MCPTokenRecord> {
  const response = await fetch(`/api/mcp-tokens/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  return handleAPIResponse<MCPTokenRecord>(response);
}

export async function toggleMCPToken(id: number): Promise<MCPTokenRecord> {
  const response = await fetch(`/api/mcp-tokens/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ action: 'toggle' }),
  });

  return handleAPIResponse<MCPTokenRecord>(response);
}

export async function deleteMCPToken(id: number): Promise<void> {
  const response = await fetch(`/api/mcp-tokens/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await handleAPIResponse<{ success: true }>(response);
}
