import type { ArticleCompositeViewRequest, MCPTokenScope } from './types';

export interface EffectiveMCPRequestScope {
  feedIds: number[] | null;
  sinceUnix: number | null;
  allowRawFallback: boolean;
  limit: number;
}

export interface ClampRequestOptions {
  nowUnix?: number;
  defaultLimit: number;
  maxLimit: number;
}

export function getScopeSinceUnix(
  timeWindowDays: number | null,
  nowUnix: number,
): number | null {
  if (!timeWindowDays || timeWindowDays <= 0) {
    return null;
  }

  return nowUnix - (timeWindowDays * 24 * 60 * 60);
}

export function clampRequestToScope(
  scope: MCPTokenScope,
  request: ArticleCompositeViewRequest,
  options: ClampRequestOptions,
): EffectiveMCPRequestScope {
  const nowUnix = options.nowUnix ?? Math.floor(Date.now() / 1000);
  const scopeSinceUnix = getScopeSinceUnix(scope.timeWindowDays, nowUnix);

  let feedIds = scope.feedIds;
  if (scope.feedIds && request.feedIds?.length) {
    feedIds = request.feedIds.filter((feedId) => scope.feedIds?.includes(feedId));
  } else if (request.feedIds?.length) {
    feedIds = request.feedIds;
  }

  let sinceUnix = request.sinceUnix ?? null;
  if (scopeSinceUnix !== null) {
    sinceUnix = sinceUnix === null ? scopeSinceUnix : Math.max(sinceUnix, scopeSinceUnix);
  }

  const requestedLimit = request.limit ?? options.defaultLimit;
  const limit = Math.min(Math.max(requestedLimit, 1), options.maxLimit);

  return {
    feedIds: feedIds && feedIds.length > 0 ? feedIds : feedIds === null ? null : [],
    sinceUnix,
    allowRawFallback: scope.allowRawFallback,
    limit,
  };
}
