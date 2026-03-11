import { getScopeSinceUnix } from './token-scope';

export type MCPAuthorizationErrorCode =
  | 'feed_forbidden'
  | 'time_window_forbidden'
  | 'raw_fallback_forbidden';

export class MCPAuthorizationError extends Error {
  code: MCPAuthorizationErrorCode;
  status: number;

  constructor(code: MCPAuthorizationErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'MCPAuthorizationError';
    this.code = code;
    this.status = 403;
  }
}

export function assertFeedAccess(
  allowedFeedIds: number[] | null,
  requestedFeedId: number,
): void {
  if (allowedFeedIds === null) {
    return;
  }

  if (!allowedFeedIds.includes(requestedFeedId)) {
    throw new MCPAuthorizationError(
      'feed_forbidden',
      `Feed ${requestedFeedId} is outside the token whitelist`,
    );
  }
}

export function assertPublishedWithinScope(
  publishedAt: number,
  input: {
    timeWindowDays: number | null;
    nowUnix?: number;
  },
): void {
  const nowUnix = input.nowUnix ?? Math.floor(Date.now() / 1000);
  const scopeSinceUnix = getScopeSinceUnix(input.timeWindowDays, nowUnix);

  if (scopeSinceUnix !== null && publishedAt < scopeSinceUnix) {
    throw new MCPAuthorizationError(
      'time_window_forbidden',
      'Article is outside the token time window',
    );
  }
}

export function assertRawFallbackAllowed(allowRawFallback: boolean): void {
  if (!allowRawFallback) {
    throw new MCPAuthorizationError(
      'raw_fallback_forbidden',
      'Token does not allow raw fallback content',
    );
  }
}
