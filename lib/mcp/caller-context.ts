import type { CallerContext, MCPTokenScope } from './types';

const UNBOUNDED_SCOPE: MCPTokenScope = {
  feedIds: null,
  timeWindowDays: null,
  allowRawFallback: true,
};

export function createSessionCallerContext(userId: number): CallerContext {
  return {
    userId,
    authKind: 'session',
    scope: UNBOUNDED_SCOPE,
  };
}

export function createTokenCallerContext(input: {
  userId: number;
  tokenId: number;
  tokenName: string;
  scope: MCPTokenScope;
}): CallerContext {
  return {
    userId: input.userId,
    authKind: 'mcp-token',
    tokenId: input.tokenId,
    tokenName: input.tokenName,
    scope: input.scope,
  };
}
