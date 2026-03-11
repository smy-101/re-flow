import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { mcpTokens, type MCPToken } from '@/lib/db/schema';
import { createTokenCallerContext } from '@/lib/mcp';
import type { CallerContext, MCPTokenScope } from '@/lib/mcp';

const MCP_TOKEN_SECRET_PREFIX = 'mcp_live_';
const DEFAULT_TOKEN_BYTES = 24;

export type MCPTokenAuthErrorCode =
  | 'invalid_token'
  | 'token_disabled'
  | 'invalid_scope';

export class MCPTokenAuthError extends Error {
  code: MCPTokenAuthErrorCode;
  status: number;

  constructor(code: MCPTokenAuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'MCPTokenAuthError';
    this.code = code;
    this.status = code === 'token_disabled' ? 403 : code === 'invalid_scope' ? 500 : 401;
  }
}

export interface GeneratedMCPTokenSecret {
  secret: string;
  tokenPrefix: string;
  tokenHash: string;
}

export interface CreateMCPTokenRecordInput {
  userId: number;
  name: string;
  feedIds?: number[] | null;
  timeWindowDays?: number | null;
  allowRawFallback?: boolean;
}

export interface CreateMCPTokenRecordResult {
  token: MCPToken;
  secret: string;
}

export function hashMCPTokenSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret, 'utf8').digest('hex');
}

export function generateMCPTokenSecret(): GeneratedMCPTokenSecret {
  const secret = `${MCP_TOKEN_SECRET_PREFIX}${crypto.randomBytes(DEFAULT_TOKEN_BYTES).toString('hex')}`;

  return {
    secret,
    tokenPrefix: secret.slice(0, 16),
    tokenHash: hashMCPTokenSecret(secret),
  };
}

export function serializeFeedWhitelist(feedIds?: number[] | null): string | null {
  if (!feedIds || feedIds.length === 0) {
    return null;
  }

  return JSON.stringify([...new Set(feedIds)].sort((left, right) => left - right));
}

export function parseFeedWhitelist(feedWhitelist: string | null): number[] | null {
  if (!feedWhitelist) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(feedWhitelist);
  } catch {
    throw new MCPTokenAuthError('invalid_scope', 'Stored feed whitelist is not valid JSON');
  }

  if (!Array.isArray(parsed) || parsed.some((value) => !Number.isInteger(value) || value <= 0)) {
    throw new MCPTokenAuthError('invalid_scope', 'Stored feed whitelist must be an array of positive integers');
  }

  return parsed;
}

export function getMCPTokenScope(record: Pick<MCPToken, 'feedWhitelist' | 'timeWindowDays' | 'allowRawFallback'>): MCPTokenScope {
  const feedIds = parseFeedWhitelist(record.feedWhitelist);

  if (record.timeWindowDays !== null && record.timeWindowDays !== undefined && record.timeWindowDays <= 0) {
    throw new MCPTokenAuthError('invalid_scope', 'Stored time window must be greater than zero');
  }

  return {
    feedIds,
    timeWindowDays: record.timeWindowDays,
    allowRawFallback: record.allowRawFallback,
  };
}

export async function resolveMCPTokenCallerContext(secret: string): Promise<CallerContext> {
  if (!secret || secret.trim().length === 0) {
    throw new MCPTokenAuthError('invalid_token', 'Bearer token is required');
  }

  const tokenHash = hashMCPTokenSecret(secret.trim());
  const token = await db.query.mcpTokens.findFirst({
    where: eq(mcpTokens.tokenHash, tokenHash),
  });

  if (!token) {
    throw new MCPTokenAuthError('invalid_token', 'Token not found');
  }

  if (!token.isEnabled) {
    throw new MCPTokenAuthError('token_disabled', 'Token is disabled');
  }

  const scope = getMCPTokenScope(token);
  const nowUnix = Math.floor(Date.now() / 1000);

  await db
    .update(mcpTokens)
    .set({
      lastUsedAt: nowUnix,
      updatedAt: nowUnix,
    })
    .where(eq(mcpTokens.id, token.id));

  return createTokenCallerContext({
    userId: token.userId,
    tokenId: token.id,
    tokenName: token.name,
    scope,
  });
}

export async function createMCPTokenRecord(
  input: CreateMCPTokenRecordInput,
): Promise<CreateMCPTokenRecordResult> {
  const generated = generateMCPTokenSecret();
  const nowUnix = Math.floor(Date.now() / 1000);

  const [token] = await db
    .insert(mcpTokens)
    .values({
      userId: input.userId,
      name: input.name,
      tokenPrefix: generated.tokenPrefix,
      tokenHash: generated.tokenHash,
      feedWhitelist: serializeFeedWhitelist(input.feedIds),
      timeWindowDays: input.timeWindowDays ?? null,
      allowRawFallback: input.allowRawFallback ?? true,
      isEnabled: true,
      createdAt: nowUnix,
      updatedAt: nowUnix,
    })
    .returning();

  return {
    token,
    secret: generated.secret,
  };
}
