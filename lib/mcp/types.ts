export const MCP_DEFAULT_RECENT_ITEMS_LIMIT = 20;
export const MCP_MAX_RECENT_ITEMS_LIMIT = 50;
export const MCP_RAW_FALLBACK_MAX_CHARS = 4_000;

export type CallerAuthKind = 'session' | 'mcp-token';

export interface MCPTokenScope {
  feedIds: number[] | null;
  timeWindowDays: number | null;
  allowRawFallback: boolean;
}

export interface CallerContext {
  userId: number;
  authKind: CallerAuthKind;
  tokenId?: number;
  tokenName?: string;
  scope: MCPTokenScope;
}

export type CompositeContentSource = 'processed' | 'raw-fallback';
export type CompositeProcessingStatus = 'done' | 'processing' | 'pending' | 'error' | 'not_requested';
export type CompositeErrorType = 'transient' | 'configuration' | 'unknown' | null;

export interface ArticleCompositeView {
  itemId: number;
  feedId: number;
  feedTitle: string;
  title: string;
  link: string;
  author: string | null;
  publishedAt: number;
  sourceType: CompositeContentSource;
  content: string;
  processingStatus: CompositeProcessingStatus;
  errorType: CompositeErrorType;
  retryable: boolean;
  lastAttemptAt: number | null;
}

export interface ArticleCompositeViewRequest {
  limit?: number;
  feedIds?: number[];
  sinceUnix?: number;
}
