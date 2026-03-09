/**
 * Test data factory functions
 *
 * These functions provide consistent mock data for tests while allowing customization.
 * All functions support an `overrides` parameter to customize specific fields.
 */

import type { Feed, NewFeed } from '@/lib/db/schema';
import type { FeedItem, NewFeedItem } from '@/lib/db/schema';
import type { User, NewUser } from '@/lib/db/schema';

/**
 * Creates a mock Feed object with default values
 * @param overrides - Partial feed object to override defaults
 * @returns A complete Feed object for testing
 *
 * @example
 * ```ts
 * const feed = createMockFeed({ title: 'Custom Feed' });
 * // Returns: { id: 1, userId: 1, title: 'Custom Feed', ...defaults }
 * ```
 */
export function createMockFeed(overrides: Partial<Feed> = {}): Feed {
  return {
    id: 1,
    userId: 1,
    title: 'Test Feed',
    feedUrl: 'https://example.com/feed.xml',
    siteUrl: 'https://example.com',
    description: 'A test feed',
    category: '技术',
    pipelineId: null,
    templateId: null,
    autoProcess: false,
    createdAt: Math.floor(Date.now() / 1000),
    lastUpdatedAt: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

/**
 * Creates a mock NewFeed object for insertions
 * @param overrides - Partial feed object to override defaults
 * @returns A NewFeed object without id and timestamps
 *
 * @example
 * ```ts
 * const newFeed = createMockNewFeed({ feedUrl: 'https://custom.com/feed.xml' });
 * ```
 */
export function createMockNewFeed(overrides: Partial<NewFeed> = {}): NewFeed {
  return {
    userId: 1,
    title: 'Test Feed',
    feedUrl: 'https://example.com/feed.xml',
    siteUrl: 'https://example.com',
    description: 'A test feed',
    category: '技术',
    pipelineId: null,
    templateId: null,
    autoProcess: false,
    ...overrides,
  };
}

/**
 * Creates a mock FeedItem object with default values
 * @param overrides - Partial item object to override defaults
 * @returns A complete FeedItem object for testing
 *
 * @example
 * ```ts
 * const item = createMockItem({ title: 'Custom Article' });
 * ```
 */
export function createMockItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    id: 1,
    feedId: 1,
    userId: 1,
    title: 'Test Article',
    link: 'https://example.com/article',
    content: 'Article content',
    publishedAt: Math.floor(Date.now() / 1000),
    author: 'Test Author',
    readingTime: 5,
    isRead: false,
    isFavorite: false,
    createdAt: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

/**
 * Creates a mock NewFeedItem object for insertions
 * @param overrides - Partial item object to override defaults
 * @returns A NewFeedItem object without id and timestamps
 *
 * @example
 * ```ts
 * const newItem = createMockNewItem({ content: '<p>HTML content</p>' });
 * ```
 */
export function createMockNewItem(overrides: Partial<NewFeedItem> = {}): NewFeedItem {
  return {
    feedId: 1,
    userId: 1,
    title: 'Test Article',
    link: 'https://example.com/article',
    content: 'Article content',
    publishedAt: Math.floor(Date.now() / 1000),
    author: 'Test Author',
    readingTime: 5,
    ...overrides,
  };
}

/**
 * Creates a mock User object with default values
 * @param overrides - Partial user object to override defaults
 * @returns A complete User object for testing
 *
 * @example
 * ```ts
 * const user = createMockUser({ username: 'customuser' });
 * ```
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'testuser',
    passwordHash: 'hashed_password_here',
    createdAt: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

/**
 * Creates a mock NewUser object for insertions
 * @param overrides - Partial user object to override defaults
 * @returns A NewUser object without id and timestamp
 *
 * @example
 * ```ts
 * const newUser = createMockNewUser({ username: 'newuser' });
 * ```
 */
export function createMockNewUser(overrides: Partial<NewUser> = {}): NewUser {
  return {
    username: 'testuser',
    passwordHash: 'hashed_password_here',
    ...overrides,
  };
}

/**
 * Creates multiple mock feeds at once
 * @param count - Number of feeds to create
 * @param overrides - Function to customize each feed by index
 * @returns An array of Feed objects
 *
 * @example
 * ```ts
 * const feeds = createMockFeeds(3, (i) => ({ title: `Feed ${i}` }));
 * // Returns: [{ title: 'Feed 0', ... }, { title: 'Feed 1', ... }, { title: 'Feed 2', ... }]
 * ```
 */
export function createMockFeeds(
  count: number,
  overrides?: (index: number) => Partial<Feed>
): Feed[] {
  return Array.from({ length: count }, (_, i) =>
    createMockFeed({
      id: i + 1,
      ...(overrides ? overrides(i) : {}),
    })
  );
}

/**
 * Creates multiple mock items at once
 * @param count - Number of items to create
 * @param overrides - Function to customize each item by index
 * @returns An array of FeedItem objects
 *
 * @example
 * ```ts
 * const items = createMockItems(5, (i) => ({ title: `Article ${i}` }));
 * ```
 */
export function createMockItems(
  count: number,
  overrides?: (index: number) => Partial<FeedItem>
): FeedItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockItem({
      id: i + 1,
      ...(overrides ? overrides(i) : {}),
    })
  );
}
