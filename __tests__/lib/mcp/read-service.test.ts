import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getArticleCompositeViewById,
  listRecentArticleCompositeViews,
} from '@/lib/mcp/read-service';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      feedItems: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      feeds: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      processingResults: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('lib/mcp/read-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clamps recent article list requests to the server max of 50', async () => {
    vi.mocked(db.query.feedItems.findMany).mockResolvedValue([]);

    await listRecentArticleCompositeViews(
      {
        userId: 1,
        authKind: 'mcp-token',
        tokenId: 1,
        tokenName: 'Desktop',
        scope: {
          feedIds: null,
          timeWindowDays: null,
          allowRawFallback: true,
        },
      },
      { limit: 999 },
    );

    expect(db.query.feedItems.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 50,
      }),
    );
  });

  it('rejects detail access for articles outside the token feed whitelist', async () => {
    vi.mocked(db.query.feedItems.findFirst).mockResolvedValue({
      id: 10,
      feedId: 99,
      userId: 1,
      title: 'Restricted article',
      link: 'https://example.com/restricted',
      content: 'secret content',
      publishedAt: 1_700_000_000,
      isRead: false,
      isFavorite: false,
      author: null,
      readingTime: null,
      createdAt: 1_700_000_100,
    });

    await expect(getArticleCompositeViewById(
      {
        userId: 1,
        authKind: 'mcp-token',
        tokenId: 1,
        tokenName: 'Desktop',
        scope: {
          feedIds: [1, 2, 3],
          timeWindowDays: null,
          allowRawFallback: true,
        },
      },
      10,
    )).rejects.toMatchObject({
      code: 'feed_forbidden',
    });
  });
});
