import {
  fetchFeeds,
  fetchFeedById,
  createFeed,
  updateFeed,
  deleteFeed,
  fetchItems,
  fetchItemById,
  markAsRead,
  toggleFavorite,
  validateFeedUrl,
  getCategories,
} from '@/lib/mock-data';

describe('Mock Data API', () => {
  beforeEach(() => {
    // Reset mock data by reinitializing
    vi.clearAllMocks();
  });

  describe('fetchFeeds', () => {
    it('returns an array of feeds', async () => {
      const feeds = await fetchFeeds();
      expect(Array.isArray(feeds)).toBe(true);
      expect(feeds.length).toBeGreaterThan(0);
    });

    it('returns feeds with correct structure', async () => {
      const feeds = await fetchFeeds();
      const feed = feeds[0];

      expect(feed).toHaveProperty('id');
      expect(feed).toHaveProperty('userId');
      expect(feed).toHaveProperty('title');
      expect(feed).toHaveProperty('feedUrl');
      expect(feed).toHaveProperty('createdAt');
      expect(feed).toHaveProperty('lastUpdatedAt');
      expect(feed).toHaveProperty('unreadCount');
    });

    it('returns feeds for current user only', async () => {
      const feeds = await fetchFeeds();
      feeds.forEach((feed) => {
        expect(feed.userId).toBe('user-1');
      });
    });
  });

  describe('fetchFeedById', () => {
    it('returns feed when id exists', async () => {
      const feeds = await fetchFeeds();
      const feed = await fetchFeedById(feeds[0].id);

      expect(feed).not.toBeNull();
      expect(feed?.id).toBe(feeds[0].id);
    });

    it('returns null when id does not exist', async () => {
      const feed = await fetchFeedById('non-existent-id');
      expect(feed).toBeNull();
    });

    it('returns null for feed from different user', async () => {
      // This would return null since all feeds are for user-1
      const feed = await fetchFeedById('feed-from-other-user');
      expect(feed).toBeNull();
    });
  });

  describe('createFeed', () => {
    it('creates a new feed with valid data', async () => {
      const newFeed = await createFeed({
        feedUrl: 'https://test.com/feed.xml',
        title: 'Test Feed',
        category: '技术',
      });

      expect(newFeed).toHaveProperty('id');
      expect(newFeed.title).toBe('Test Feed');
      expect(newFeed.feedUrl).toBe('https://test.com/feed.xml');
      expect(newFeed.category).toBe('技术');
    });

    it('throws error for duplicate feed URL', async () => {
      await expect(
        createFeed({
          feedUrl: 'https://www.ruanyifeng.com/blog/atom.xml',
        })
      ).rejects.toThrow('此订阅已存在');
    });

    it('creates feed without optional fields', async () => {
      const newFeed = await createFeed({
        feedUrl: 'https://unique-test.com/feed.xml',
      });

      expect(newFeed).toHaveProperty('id');
      expect(newFeed.feedUrl).toBe('https://unique-test.com/feed.xml');
    });
  });

  describe('updateFeed', () => {
    it('updates feed title', async () => {
      const feeds = await fetchFeeds();
      const originalFeed = feeds[0];

      const updated = await updateFeed(originalFeed.id, {
        title: 'Updated Title',
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('Updated Title');
    });

    it('updates feed category', async () => {
      const feeds = await fetchFeeds();
      const originalFeed = feeds[0];

      const updated = await updateFeed(originalFeed.id, {
        category: '设计',
      });

      expect(updated).not.toBeNull();
      expect(updated?.category).toBe('设计');
    });

    it('returns null for non-existent feed', async () => {
      const updated = await updateFeed('non-existent-id', {
        title: 'New Title',
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteFeed', () => {
    it('deletes an existing feed', async () => {
      const newFeed = await createFeed({
        feedUrl: 'https://to-delete.com/feed.xml',
      });

      const deleted = await deleteFeed(newFeed.id);
      expect(deleted).toBe(true);

      const feed = await fetchFeedById(newFeed.id);
      expect(feed).toBeNull();
    });

    it('returns false for non-existent feed', async () => {
      const deleted = await deleteFeed('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('fetchItems', () => {
    it('returns an array of items', async () => {
      const items = await fetchItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('returns items with correct structure', async () => {
      const items = await fetchItems();
      const item = items[0];

      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('feedId');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('link');
      expect(item).toHaveProperty('content');
      expect(item).toHaveProperty('publishedAt');
      expect(item).toHaveProperty('isRead');
      expect(item).toHaveProperty('isFavorite');
    });

    it('filters by feedId when provided', async () => {
      const feeds = await fetchFeeds();
      const items = await fetchItems({ feedId: feeds[0].id });

      items.forEach((item) => {
        expect(item.feedId).toBe(feeds[0].id);
      });
    });

    it('filters by isRead when provided', async () => {
      const unreadItems = await fetchItems({ isRead: false });

      unreadItems.forEach((item) => {
        expect(item.isRead).toBe(false);
      });
    });

    it('filters by isFavorite when provided', async () => {
      const favoriteItems = await fetchItems({ isFavorite: true });

      favoriteItems.forEach((item) => {
        expect(item.isFavorite).toBe(true);
      });
    });
  });

  describe('fetchItemById', () => {
    it('returns item when id exists', async () => {
      const items = await fetchItems();
      const item = await fetchItemById(items[0].id);

      expect(item).not.toBeNull();
      expect(item?.id).toBe(items[0].id);
    });

    it('returns null when id does not exist', async () => {
      const item = await fetchItemById('non-existent-id');
      expect(item).toBeNull();
    });
  });

  describe('markAsRead', () => {
    it('marks item as read', async () => {
      const items = await fetchItems();
      const unreadItem = items.find((i) => !i.isRead);

      if (unreadItem) {
        const updated = await markAsRead(unreadItem.id, true);
        expect(updated?.isRead).toBe(true);
      }
    });

    it('marks item as unread', async () => {
      const items = await fetchItems();
      const readItem = items.find((i) => i.isRead);

      if (readItem) {
        const updated = await markAsRead(readItem.id, false);
        expect(updated?.isRead).toBe(false);
      }
    });
  });

  describe('toggleFavorite', () => {
    it('toggles favorite status', async () => {
      const items = await fetchItems();
      const item = items[0];

      const originalStatus = item.isFavorite;
      const updated = await toggleFavorite(item.id);

      expect(updated?.isFavorite).toBe(!originalStatus);
    });
  });

  describe('validateFeedUrl', () => {
    it('validates a valid URL', async () => {
      const result = await validateFeedUrl('https://example.com/feed.xml');

      expect(result.valid).toBe(true);
      expect(result.title).toBeDefined();
    });

    it('rejects an invalid URL', async () => {
      const result = await validateFeedUrl('https://invalid.com/feed');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects a malformed URL', async () => {
      const result = await validateFeedUrl('not-a-url');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getCategories', () => {
    it('returns an array of categories', () => {
      const categories = getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('技术');
      expect(categories).toContain('设计');
    });
  });

  describe('Network delay simulation', () => {
    it('takes at least 300ms for API calls', async () => {
      const start = Date.now();
      await fetchFeeds();
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(300);
    });
  });
});
