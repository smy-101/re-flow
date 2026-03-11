import type { MCPToken } from '@/lib/db/schema';
import { getMCPTokenScope } from '@/lib/auth/mcp-token';

export interface MCPTokenResponseRecord {
  id: number;
  name: string;
  tokenPrefix: string;
  isEnabled: boolean;
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
  scope: ReturnType<typeof getMCPTokenScope>;
}

export function toMCPTokenResponseRecord(token: MCPToken): MCPTokenResponseRecord {
  return {
    id: token.id,
    name: token.name,
    tokenPrefix: token.tokenPrefix,
    isEnabled: token.isEnabled,
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
    lastUsedAt: token.lastUsedAt,
    scope: getMCPTokenScope(token),
  };
}
