import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { feedItems, feeds, processingResults } from '@/lib/db/schema';
import {
  MCP_DEFAULT_RECENT_ITEMS_LIMIT,
  MCP_MAX_RECENT_ITEMS_LIMIT,
  type ArticleCompositeView,
  type ArticleCompositeViewRequest,
  type CallerContext,
} from './types';
import { buildArticleCompositeView } from './article-view';
import { assertFeedAccess, assertPublishedWithinScope, MCPAuthorizationError } from './authorization';
import { clampRequestToScope } from './token-scope';

export class MCPResourceNotFoundError extends Error {
  code = 'not_found' as const;
  status = 404;

  constructor(message: string) {
    super(message);
    this.name = 'MCPResourceNotFoundError';
  }
}

function groupProcessingResults(
  rows: Awaited<ReturnType<typeof db.query.processingResults.findMany>>,
) {
  const grouped = new Map<number, typeof rows>();

  for (const row of rows) {
    const existing = grouped.get(row.feedItemId) ?? [];
    existing.push(row);
    grouped.set(row.feedItemId, existing);
  }

  return grouped;
}

function createFeedTitleMap(rows: Awaited<ReturnType<typeof db.query.feeds.findMany>>) {
  return new Map(rows.map((row) => [row.id, row.title]));
}

export async function listRecentArticleCompositeViews(
  caller: CallerContext,
  request: ArticleCompositeViewRequest = {},
): Promise<ArticleCompositeView[]> {
  const effectiveScope = clampRequestToScope(caller.scope, request, {
    defaultLimit: MCP_DEFAULT_RECENT_ITEMS_LIMIT,
    maxLimit: MCP_MAX_RECENT_ITEMS_LIMIT,
  });

  if (effectiveScope.feedIds !== null && effectiveScope.feedIds.length === 0) {
    return [];
  }

  const conditions = [eq(feedItems.userId, caller.userId)];
  if (effectiveScope.feedIds !== null) {
    conditions.push(inArray(feedItems.feedId, effectiveScope.feedIds));
  }
  if (effectiveScope.sinceUnix !== null) {
    conditions.push(gte(feedItems.publishedAt, effectiveScope.sinceUnix));
  }

  const items = await db.query.feedItems.findMany({
    where: conditions.length === 1 ? conditions[0] : and(...conditions),
    orderBy: [desc(feedItems.publishedAt)],
    limit: effectiveScope.limit,
  });

  if (items.length === 0) {
    return [];
  }

  const feedIds = [...new Set(items.map((item) => item.feedId))];
  const itemIds = items.map((item) => item.id);

  const [feedRows, processingRows] = await Promise.all([
    db.query.feeds.findMany({
      where: inArray(feeds.id, feedIds),
    }),
    db.query.processingResults.findMany({
      where: inArray(processingResults.feedItemId, itemIds),
      orderBy: [desc(processingResults.completedAt), desc(processingResults.createdAt)],
    }),
  ]);

  const feedTitleMap = createFeedTitleMap(feedRows);
  const processingMap = groupProcessingResults(processingRows);

  return items.flatMap((item) => {
    try {
      return [
        buildArticleCompositeView({
          item,
          feedTitle: feedTitleMap.get(item.feedId) ?? `Feed ${item.feedId}`,
          processingResults: processingMap.get(item.id) ?? [],
          allowRawFallback: effectiveScope.allowRawFallback,
        }),
      ];
    } catch (error) {
      if (error instanceof MCPAuthorizationError && error.code === 'raw_fallback_forbidden') {
        return [];
      }

      throw error;
    }
  });
}

export async function getArticleCompositeViewById(
  caller: CallerContext,
  itemId: number,
): Promise<ArticleCompositeView> {
  const item = await db.query.feedItems.findFirst({
    where: and(eq(feedItems.id, itemId), eq(feedItems.userId, caller.userId)),
  });

  if (!item) {
    throw new MCPResourceNotFoundError(`Feed item ${itemId} not found`);
  }

  assertFeedAccess(caller.scope.feedIds, item.feedId);
  assertPublishedWithinScope(item.publishedAt, {
    timeWindowDays: caller.scope.timeWindowDays,
  });

  const [feedRecord, itemProcessingResults] = await Promise.all([
    db.query.feeds.findFirst({
      where: eq(feeds.id, item.feedId),
    }),
    db.query.processingResults.findMany({
      where: eq(processingResults.feedItemId, item.id),
      orderBy: [desc(processingResults.completedAt), desc(processingResults.createdAt)],
    }),
  ]);

  return buildArticleCompositeView({
    item,
    feedTitle: feedRecord?.title ?? `Feed ${item.feedId}`,
    processingResults: itemProcessingResults,
    allowRawFallback: caller.scope.allowRawFallback,
  });
}
