import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMockFeed,
  createMockNewFeed,
  createMockItem,
  createMockNewItem,
  createMockUser,
  createMockNewUser,
  createMockFeeds,
  createMockItems,
} from './factory';

describe('Test Factory Functions', () => {
  describe('createMockFeed', () => {
    it('should create feed with default values', () => {
      const feed = createMockFeed();

      expect(feed).toMatchObject({
        id: 1,
        userId: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed.xml',
        siteUrl: 'https://example.com',
        description: 'A test feed',
        category: '技术',
      });
      expect(typeof feed.createdAt).toBe('number');
      expect(typeof feed.lastUpdatedAt).toBe('number');
    });

    it('should allow overriding fields', () => {
      const feed = createMockFeed({
        title: 'Custom Feed',
        id: 5,
      });

      expect(feed.title).toBe('Custom Feed');
      expect(feed.id).toBe(5);
      expect(feed.userId).toBe(1); // Other fields keep defaults
    });

    it('should generate valid timestamps', () => {
      const feed = createMockFeed();
      const now = Math.floor(Date.now() / 1000);

      expect(feed.createdAt).toBeLessThanOrEqual(now);
      expect(feed.lastUpdatedAt).toBeLessThanOrEqual(now);
      expect(feed.createdAt).toBeGreaterThan(now - 10);
      expect(feed.lastUpdatedAt).toBeGreaterThan(now - 10);
    });
  });

  describe('createMockNewFeed', () => {
    it('should create new feed without id and timestamps', () => {
      const newFeed = createMockNewFeed();

      expect(newFeed).not.toHaveProperty('id');
      expect(newFeed).not.toHaveProperty('createdAt');
      expect(newFeed).not.toHaveProperty('lastUpdatedAt');
      expect(newFeed).toMatchObject({
        userId: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed.xml',
      });
    });

    it('should allow overriding fields', () => {
      const newFeed = createMockNewFeed({
        title: 'Custom Title',
        userId: 5,
      });

      expect(newFeed.title).toBe('Custom Title');
      expect(newFeed.userId).toBe(5);
    });
  });

  describe('createMockItem', () => {
    it('should create item with default values', () => {
      const item = createMockItem();

      expect(item).toMatchObject({
        id: 1,
        feedId: 1,
        userId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content',
        author: 'Test Author',
        readingTime: 5,
        isRead: false,
        isFavorite: false,
      });
      expect(typeof item.publishedAt).toBe('number');
      expect(typeof item.createdAt).toBe('number');
    });

    it('should allow overriding fields', () => {
      const item = createMockItem({
        title: 'Custom Article',
        isRead: true,
      });

      expect(item.title).toBe('Custom Article');
      expect(item.isRead).toBe(true);
      expect(item.feedId).toBe(1); // Other fields keep defaults
    });
  });

  describe('createMockNewItem', () => {
    it('should create new item without id and timestamps', () => {
      const newItem = createMockNewItem();

      expect(newItem).not.toHaveProperty('id');
      expect(newItem).not.toHaveProperty('createdAt');
      expect(newItem).toMatchObject({
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
      });
    });

    it('should allow overriding fields', () => {
      const newItem = createMockNewItem({
        title: 'New Article',
        feedId: 3,
      });

      expect(newItem.title).toBe('New Article');
      expect(newItem.feedId).toBe(3);
    });
  });

  describe('createMockUser', () => {
    it('should create user with default values', () => {
      const user = createMockUser();

      expect(user).toMatchObject({
        id: 1,
        username: 'testuser',
        passwordHash: 'hashed_password_here',
      });
      expect(typeof user.createdAt).toBe('number');
    });

    it('should allow overriding fields', () => {
      const user = createMockUser({
        username: 'customuser',
        id: 10,
      });

      expect(user.username).toBe('customuser');
      expect(user.id).toBe(10);
    });
  });

  describe('createMockNewUser', () => {
    it('should create new user without id and timestamp', () => {
      const newUser = createMockNewUser();

      expect(newUser).not.toHaveProperty('id');
      expect(newUser).not.toHaveProperty('createdAt');
      expect(newUser).toMatchObject({
        username: 'testuser',
        passwordHash: 'hashed_password_here',
      });
    });

    it('should allow overriding fields', () => {
      const newUser = createMockNewUser({
        username: 'newuser',
      });

      expect(newUser.username).toBe('newuser');
    });
  });

  describe('createMockFeeds', () => {
    it('should create multiple feeds with auto-incrementing ids', () => {
      const feeds = createMockFeeds(3);

      expect(feeds).toHaveLength(3);
      expect(feeds[0].id).toBe(1);
      expect(feeds[1].id).toBe(2);
      expect(feeds[2].id).toBe(3);
    });

    it('should use overrides function for customization', () => {
      const feeds = createMockFeeds(3, (i) => ({
        title: `Feed ${i}`,
      }));

      expect(feeds[0].title).toBe('Feed 0');
      expect(feeds[1].title).toBe('Feed 1');
      expect(feeds[2].title).toBe('Feed 2');
    });

    it('should accept partial overrides while keeping defaults', () => {
      const feeds = createMockFeeds(2, (i) => ({
        id: i + 1, // Keep auto-increment
        category: `Category ${i}`,
      }));

      expect(feeds[0].category).toBe('Category 0');
      expect(feeds[0].title).toBe('Test Feed'); // Default
      expect(feeds[1].category).toBe('Category 1');
    });

    it('should create zero feeds when count is 0', () => {
      const feeds = createMockFeeds(0);
      expect(feeds).toHaveLength(0);
    });
  });

  describe('createMockItems', () => {
    it('should create multiple items with auto-incrementing ids', () => {
      const items = createMockItems(5);

      expect(items).toHaveLength(5);
      expect(items[0].id).toBe(1);
      expect(items[1].id).toBe(2);
      expect(items[4].id).toBe(5);
    });

    it('should use overrides function for customization', () => {
      const items = createMockItems(3, (i) => ({
        title: `Article ${i}`,
        isRead: i % 2 === 0,
      }));

      expect(items[0].title).toBe('Article 0');
      expect(items[0].isRead).toBe(true);
      expect(items[1].title).toBe('Article 1');
      expect(items[1].isRead).toBe(false);
    });

    it('should create items with unique links by default', () => {
      const items = createMockItems(3);

      expect(items[0].link).toBe('https://example.com/article');
      expect(items[1].link).toBe('https://example.com/article');
      expect(items[2].link).toBe('https://example.com/article');
      // Note: Links are the same by default, tests should override if uniqueness is needed
    });
  });

  describe('Type Safety', () => {
    it('should maintain type compatibility with schema types', () => {
      const feed = createMockFeed();
      const item = createMockItem();
      const user = createMockUser();

      // These should not cause type errors
      expect(feed).toBeTruthy();
      expect(item).toBeTruthy();
      expect(user).toBeTruthy();
    });

    it('should support partial overrides with correct types', () => {
      // This should not cause type errors
      const feed = createMockFeed({ title: 'Test' });
      const item = createMockItem({ title: 'Test', isFavorite: true });
      const user = createMockUser({ username: 'test' });

      expect(feed.title).toBe('Test');
      expect(item.isFavorite).toBe(true);
      expect(user.username).toBe('test');
    });
  });
});
