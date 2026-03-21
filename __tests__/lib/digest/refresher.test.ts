import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { refreshFeedsForDigest } from '@/lib/digest/refresher';
import { db } from '@/lib/db';
import { emailDigestFilters } from '@/lib/db/schema';
import { createMockFeed } from '@/__tests__/utils/factory';

// Mock the RSS fetcher module
vi.mock('@/lib/rss/fetcher', () => ({
  fetchAndStoreItems: vi.fn(),
}));

import { fetchAndStoreItems } from '@/lib/rss/fetcher';

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      feeds: {
        findMany: vi.fn(),
      },
      emailDigestFilters: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('Digest Refresher', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('refreshFeedsForDigest', () => {
    describe('Filter Type: all', () => {
      it('should refresh all feeds for user when filterType is all', async () => {
        const mockFeeds = [
          createMockFeed({ id: 1, userId: 1, lastUpdatedAt: 0 }),
          createMockFeed({ id: 2, userId: 1, lastUpdatedAt: 0 }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'all', filterValue: null } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);
        vi.mocked(fetchAndStoreItems).mockResolvedValue({ success: true, itemsAdded: 5 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(true);
        expect(result.feedsProcessed).toBe(2);
        expect(result.totalItemsAdded).toBe(10);
        expect(db.query.feeds.findMany).toHaveBeenCalledTimes(2);
      });

      it('should default to all feeds when no filter exists', async () => {
        const mockFeeds = [createMockFeed({ id: 1, userId: 1, lastUpdatedAt: 0 })];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);
        vi.mocked(fetchAndStoreItems).mockResolvedValue({ success: true, itemsAdded: 3 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(true);
        expect(result.feedsProcessed).toBe(1);
        expect(result.totalItemsAdded).toBe(3);
      });
    });

    describe('Filter Type: category', () => {
      it('should refresh only feeds in specified category', async () => {
        const techFeeds = [
          createMockFeed({ id: 1, userId: 1, category: '技术', lastUpdatedAt: 0 }),
          createMockFeed({ id: 2, userId: 1, category: '技术', lastUpdatedAt: 0 }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'category', filterValue: '技术' } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(techFeeds);
        vi.mocked(fetchAndStoreItems).mockResolvedValue({ success: true, itemsAdded: 2 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(true);
        expect(result.feedsProcessed).toBe(2);
        expect(result.totalItemsAdded).toBe(4);
      });

      it('should return empty result when no feeds in category', async () => {
        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'category', filterValue: '不存在的分类' } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([]);

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(true);
        expect(result.feedsProcessed).toBe(0);
        expect(result.totalItemsAdded).toBe(0);
      });
    });

    describe('Filter Type: feed', () => {
      it('should refresh only the specified feed', async () => {
        const targetFeed = createMockFeed({ id: 5, userId: 1, lastUpdatedAt: 0 });

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'feed', filterValue: '5' } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([targetFeed]);
        vi.mocked(fetchAndStoreItems).mockResolvedValue({ success: true, itemsAdded: 10 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(true);
        expect(result.feedsProcessed).toBe(1);
        expect(result.totalItemsAdded).toBe(10);
      });

      it('should handle invalid feed ID gracefully', async () => {
        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'feed', filterValue: 'invalid' } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue([]);

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(true);
        expect(result.feedsProcessed).toBe(0);
        expect(result.totalItemsAdded).toBe(0);
      });
    });

    describe('Minimum Refresh Interval', () => {
      it('should skip feeds refreshed within last 5 minutes', async () => {
        const recentTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago
        const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago

        const mockFeeds = [
          createMockFeed({ id: 1, userId: 1, lastUpdatedAt: recentTimestamp, title: 'Recent Feed' }),
          createMockFeed({ id: 2, userId: 1, lastUpdatedAt: oldTimestamp, title: 'Old Feed' }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'all', filterValue: null } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);
        vi.mocked(fetchAndStoreItems).mockResolvedValue({ success: true, itemsAdded: 5 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.feedsSkipped).toBe(1);
        expect(result.feedsProcessed).toBe(1);
        expect(result.feedResults[0].skipped).toBe(true);
        expect(result.feedResults[1].skipped).toBeUndefined();
      });

      it('should skip feed when lastUpdatedAt is exactly 4 minutes ago', async () => {
        const fourMinutesAgo = Math.floor(Date.now() / 1000) - 240;

        const mockFeeds = [
          createMockFeed({ id: 1, userId: 1, lastUpdatedAt: fourMinutesAgo }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'all', filterValue: null } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.feedsSkipped).toBe(1);
        expect(result.feedsProcessed).toBe(0);
      });

      it('should refresh feed when lastUpdatedAt is exactly 6 minutes ago', async () => {
        const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360;

        const mockFeeds = [
          createMockFeed({ id: 1, userId: 1, lastUpdatedAt: sixMinutesAgo }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'all', filterValue: null } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);
        vi.mocked(fetchAndStoreItems).mockResolvedValue({ success: true, itemsAdded: 1 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.feedsSkipped).toBe(0);
        expect(result.feedsProcessed).toBe(1);
      });
    });

    describe('Error Handling', () => {
      it('should handle fetch failure for individual feed', async () => {
        const mockFeeds = [
          createMockFeed({ id: 1, userId: 1, lastUpdatedAt: 0 }),
          createMockFeed({ id: 2, userId: 1, lastUpdatedAt: 0 }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'all', filterValue: null } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);
        vi.mocked(fetchAndStoreItems)
          .mockResolvedValueOnce({ success: false, itemsAdded: 0, error: 'Network error' })
          .mockResolvedValueOnce({ success: true, itemsAdded: 5 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(true);
        expect(result.feedsProcessed).toBe(2);
        expect(result.errors).toContain('Feed 1: Network error');
        expect(result.feedResults[0].success).toBe(false);
        expect(result.feedResults[1].success).toBe(true);
      });

      it('should handle exception during fetch', async () => {
        const mockFeeds = [
          createMockFeed({ id: 1, userId: 1, lastUpdatedAt: 0 }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'all', filterValue: null } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);
        vi.mocked(fetchAndStoreItems).mockRejectedValue(new Error('Unexpected error'));

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.feedsProcessed).toBe(1);
        expect(result.errors.length).toBe(1);
        expect(result.feedResults[0].success).toBe(false);
      });

      it('should handle database query failure', async () => {
        vi.mocked(db.query.emailDigestFilters.findMany).mockRejectedValue(new Error('DB error'));

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.success).toBe(false);
        expect(result.errors.length).toBe(1);
      });
    });

    describe('Feed Results Tracking', () => {
      it('should return detailed results for each feed', async () => {
        const mockFeeds = [
          createMockFeed({ id: 1, userId: 1, title: 'Feed A', lastUpdatedAt: 0 }),
          createMockFeed({ id: 2, userId: 1, title: 'Feed B', lastUpdatedAt: 0 }),
        ];

        vi.mocked(db.query.emailDigestFilters.findMany).mockResolvedValue([
          { filterType: 'all', filterValue: null } as unknown as typeof emailDigestFilters.$inferSelect,
        ]);
        vi.mocked(db.query.feeds.findMany).mockResolvedValue(mockFeeds);
        vi.mocked(fetchAndStoreItems)
          .mockResolvedValueOnce({ success: true, itemsAdded: 3 })
          .mockResolvedValueOnce({ success: true, itemsAdded: 7 });

        const result = await refreshFeedsForDigest(1, 1);

        expect(result.feedResults).toHaveLength(2);
        expect(result.feedResults[0]).toMatchObject({
          feedId: 1,
          feedTitle: 'Feed A',
          success: true,
          itemsAdded: 3,
        });
        expect(result.feedResults[1]).toMatchObject({
          feedId: 2,
          feedTitle: 'Feed B',
          success: true,
          itemsAdded: 7,
        });
      });
    });
  });
});
