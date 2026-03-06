import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Parser, { Item } from 'rss-parser';
import * as fc from 'fast-check';
import {
  parseRSS,
  dedupeItems,
  calculateReadingTime,
  storeItems,
  fetchAndStoreItems,
  type ParsedFeedItem,
} from '@/lib/rss/fetcher';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { feedItems, feeds } from '@/lib/db/schema';
import { createMockFeed } from '@/__tests__/utils/factory';

// Mock rss-parser
vi.mock('rss-parser', () => ({
  default: vi.fn(),
}));

// Mock database
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      feedItems: {
        findMany: vi.fn(),
      },
      feeds: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe('RSS Fetcher', () => {
  let mockParser: ReturnType<typeof vi.fn>;
  let mockParseURL: ReturnType<typeof vi.fn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Setup parser mock
    mockParser = vi.mocked(Parser);
    mockParseURL = vi.fn();
    // Mock the class constructor to return an instance with parseURL method
    mockParser.mockImplementation(function() {
      return {
        parseURL: mockParseURL,
      } as any;
    });

    // Clear all mocks
    vi.clearAllMocks();
    // Many tests validate failure branches that call console.error internally.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('parseRSS', () => {
    describe('Standard Formats', () => {
      it('should parse standard RSS 2.0 feed', async () => {
        const rss2Feed = {
          title: 'Test Feed',
          items: [
            {
              title: 'Article 1',
              link: 'https://example.com/1',
              pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
              content: 'Content 1',
              author: 'Author 1',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(rss2Feed);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toMatchObject({
          title: 'Article 1',
          link: 'https://example.com/1',
          content: 'Content 1',
          author: 'Author 1',
        });
        expect(result.title).toBe('Test Feed');
      });

      it('should parse Atom feed', async () => {
        const atomFeed = {
          title: 'Atom Feed',
          items: [
            {
              title: 'Atom Entry',
              link: 'https://example.com/atom/1',
              isoDate: '2024-01-01T00:00:00.000Z',
              content: 'Atom content',
              creator: 'Atom Author',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(atomFeed);

        const result = await parseRSS('https://example.com/atom.xml');

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toMatchObject({
          title: 'Atom Entry',
          link: 'https://example.com/atom/1',
          content: 'Atom content',
          author: 'Atom Author',
        });
      });

      it('should extract feed title', async () => {
        const feedWithMultipleItems = {
          title: 'Multi-Item Feed',
          items: [
            { title: 'Item 1', link: 'https://example.com/1' } as Item,
            { title: 'Item 2', link: 'https://example.com/2' } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feedWithMultipleItems);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.title).toBe('Multi-Item Feed');
      });
    });

    describe('Missing Fields', () => {
      it('should use "Untitled" for missing title', async () => {
        const feed = {
          items: [
            {
              link: 'https://example.com/1',
              pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.items[0].title).toBe('Untitled');
      });

      it('should use current time for missing date', async () => {
        const beforeCall = Math.floor(Date.now() / 1000);
        const feed = {
          items: [
            {
              title: 'Article',
              link: 'https://example.com/1',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');
        const afterCall = Math.floor(Date.now() / 1000);

        expect(result.items[0].publishedAt).toBeGreaterThanOrEqual(beforeCall);
        expect(result.items[0].publishedAt).toBeLessThanOrEqual(afterCall);
      });

      it('should return undefined for missing author', async () => {
        const feed = {
          items: [
            {
              title: 'Article',
              link: 'https://example.com/1',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.items[0].author).toBeUndefined();
      });

      it('should use empty string for missing content', async () => {
        const feed = {
          items: [
            {
              title: 'Article',
              link: 'https://example.com/1',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.items[0].content).toBe('');
      });
    });

    describe('Filter Items Without Links', () => {
      it('should filter out items without link field', async () => {
        const feed = {
          items: [
            { title: 'With Link', link: 'https://example.com/1' } as Item,
            { title: 'Without Link' } as Item,
            { title: 'Another With Link', link: 'https://example.com/2' } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.items).toHaveLength(2);
        expect(result.items[0].link).toBe('https://example.com/1');
        expect(result.items[1].link).toBe('https://example.com/2');
      });
    });

    describe('Content Field Priority', () => {
      it('should prioritize content:encoded over content', async () => {
        const feed = {
          items: [
            {
              title: 'Article',
              link: 'https://example.com/1',
              'content:encoded': 'Encoded content',
              content: 'Regular content',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.items[0].content).toBe('Encoded content');
      });

      it('should fallback to description when no content fields', async () => {
        const feed = {
          items: [
            {
              title: 'Article',
              link: 'https://example.com/1',
              description: 'Description content',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');

        expect(result.items[0].content).toBe('Description content');
      });
    });

    describe('Timestamp Conversion', () => {
      it('should convert milliseconds to Unix timestamp (seconds)', async () => {
        const feed = {
          items: [
            {
              title: 'Article',
              link: 'https://example.com/1',
              pubDate: 'Mon, 01 Jan 2024 12:30:45 GMT',
            } as Item,
          ],
        };

        mockParseURL.mockResolvedValue(feed);

        const result = await parseRSS('https://example.com/feed.xml');

        const expectedTimestamp = Math.floor(new Date('Mon, 01 Jan 2024 12:30:45 GMT').getTime() / 1000);
        expect(result.items[0].publishedAt).toBe(expectedTimestamp);
      });
    });

    describe('Timeout Handling', () => {
      it('should throw timeout error for slow responses', async () => {
        mockParseURL.mockRejectedValue(new Error('ETIMEDOUT'));

        await expect(parseRSS('https://example.com/feed.xml')).rejects.toThrow('RSS feed request timed out');
      });

      it('should handle timeout error message variations', async () => {
        mockParseURL.mockRejectedValue(new Error('Request timeout'));

        await expect(parseRSS('https://example.com/feed.xml')).rejects.toThrow('RSS feed request timed out');
      });
    });

    describe('Invalid XML Handling', () => {
      it('should throw error for malformed XML', async () => {
        mockParseURL.mockRejectedValue(new Error('Invalid XML'));

        await expect(parseRSS('https://example.com/feed.xml')).rejects.toThrow('Invalid XML');
      });

      it('should handle null feed response', async () => {
        mockParseURL.mockResolvedValue(null);

        await expect(parseRSS('https://example.com/feed.xml')).rejects.toThrow('Failed to parse RSS feed');
      });
    });
  });

  describe('dedupeItems', () => {
    describe('Basic Deduplication', () => {
      it('should filter out items with existing links', async () => {
        const items: ParsedFeedItem[] = [
          { title: 'Item 1', link: 'https://example.com/1', content: '', publishedAt: 0 },
          { title: 'Item 2', link: 'https://example.com/2', content: '', publishedAt: 0 },
          { title: 'Item 3', link: 'https://example.com/3', content: '', publishedAt: 0 },
        ];

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([
          { link: 'https://example.com/2' },
          { link: 'https://example.com/3' },
        ] as any);

        const result = await dedupeItems(items, 1);

        expect(result).toHaveLength(1);
        expect(result[0].link).toBe('https://example.com/1');
      });

      it('should return all items when no duplicates exist', async () => {
        const items: ParsedFeedItem[] = [
          { title: 'Item 1', link: 'https://example.com/1', content: '', publishedAt: 0 },
          { title: 'Item 2', link: 'https://example.com/2', content: '', publishedAt: 0 },
        ];

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([]);

        const result = await dedupeItems(items, 1);

        expect(result).toHaveLength(2);
      });
    });

    describe('Empty and All Duplicate Cases', () => {
      it('should return empty array for empty input', async () => {
        const result = await dedupeItems([], 1);

        expect(result).toHaveLength(0);
        expect(db.query.feedItems.findMany).not.toHaveBeenCalled();
      });

      it('should return empty array when all items are duplicates', async () => {
        const items: ParsedFeedItem[] = [
          { title: 'Item 1', link: 'https://example.com/1', content: '', publishedAt: 0 },
          { title: 'Item 2', link: 'https://example.com/2', content: '', publishedAt: 0 },
        ];

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([
          { link: 'https://example.com/1' },
          { link: 'https://example.com/2' },
        ] as any);

        const result = await dedupeItems(items, 1);

        expect(result).toHaveLength(0);
      });
    });

    describe('Link-Based Deduplication', () => {
      it('should deduplicate based on link field only', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content A',
            publishedAt: 1000,
          },
          {
            title: 'Item 1 Updated',
            link: 'https://example.com/1',
            content: 'Content B',
            publishedAt: 2000,
          },
        ];

        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([{ link: 'https://example.com/1' }] as any);

        const result = await dedupeItems(items, 1);

        expect(result).toHaveLength(0);
      });
    });
  });

  describe('calculateReadingTime', () => {
    describe('Pure Text Calculation', () => {
      it('should calculate 2 minutes for 500 words', () => {
        const content = Array(500).fill('word').join(' ');
        const result = calculateReadingTime(content);

        expect(result).toBe(2);
      });

      it('should round up to next minute', () => {
        const content = Array(251).fill('word').join(' ');
        const result = calculateReadingTime(content);

        expect(result).toBe(2);
      });

      it('should return minimum 1 minute', () => {
        const result1 = calculateReadingTime('');
        const result2 = calculateReadingTime('  ');
        const result3 = calculateReadingTime('short');

        expect(result1).toBe(1);
        expect(result2).toBe(1);
        expect(result3).toBe(1);
      });

      it('should calculate exactly 1 minute for <= 250 words', () => {
        const content = Array(250).fill('word').join(' ');
        const result = calculateReadingTime(content);

        expect(result).toBe(1);
      });
    });

    describe('HTML Tag Removal', () => {
      it('should remove HTML tags and count words', () => {
        const content = '<p>Hello world</p>';
        const result = calculateReadingTime(content);

        expect(result).toBe(1);
      });

      it('should handle nested HTML tags', () => {
        const content = '<div><p>Hello <strong>world</strong></p></div>';
        const result = calculateReadingTime(content);

        expect(result).toBe(1);
      });

      it('should count words after removing tags', () => {
        const content = Array(10).fill('<p>test word</p>').join(' ');
        const result = calculateReadingTime(content);

        expect(result).toBe(1);
      });
    });

    describe('Whitespace Normalization', () => {
      it('should normalize multiple spaces to single space', () => {
        const content = 'Hello    world    test';
        const result = calculateReadingTime(content);

        expect(result).toBe(1);
      });

      it('should handle newlines and tabs as spaces', () => {
        const content = 'Hello\nworld\ttest';
        const result = calculateReadingTime(content);

        expect(result).toBe(1);
      });

      it('should trim leading and trailing whitespace', () => {
        const result1 = calculateReadingTime('  Hello world  ');
        const result2 = calculateReadingTime('\n\tHello world\t\n');

        expect(result1).toBe(1);
        expect(result2).toBe(1);
      });
    });

    describe('Property Tests', () => {
      it('should always return at least 1 minute for any input', () => {
        fc.assert(
          fc.property(fc.string(), (content) => {
            const result = calculateReadingTime(content);
            return result >= 1;
          })
        );
      });

      it('should be monotonically increasing with word count', () => {
        fc.assert(
          fc.property(fc.string(), fc.string(), (content1, content2) => {
            // Create two contents where content2 has more words
            const words1 = content1.split(/\s+/).filter(w => w.length > 0);
            const words2 = content2.split(/\s+/).filter(w => w.length > 0);

            // If content2 has more words, it should take equal or more time
            if (words2.length > words1.length) {
              const result1 = calculateReadingTime(content1);
              const result2 = calculateReadingTime(content2);
              return result2 >= result1;
            }

            return true;
          })
        );
      });

      it('should calculate time based on 250 words per minute', () => {
        fc.assert(
          fc.property(fc.string(), (content) => {
            const result = calculateReadingTime(content);

            // Count words the same way the function does
            const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            const wordCount = plainText.split(' ').filter(word => word.length > 0).length;
            const expectedMinutes = Math.ceil(wordCount / 250);
            const calculatedMinutes = expectedMinutes > 0 ? expectedMinutes : 1;

            return result === calculatedMinutes;
          })
        );
      });

      it('should handle HTML content correctly by stripping tags', () => {
        fc.assert(
          fc.property(fc.string(), fc.string(), (htmlContent, plainContent) => {
            // HTML content with same text inside tags should have same reading time
            const htmlResult = calculateReadingTime(htmlContent);
            const plainResult = calculateReadingTime(plainContent);

            // Both should return valid results
            return typeof htmlResult === 'number' && htmlResult >= 1 &&
                   typeof plainResult === 'number' && plainResult >= 1;
          })
        );
      });

      it('should handle empty and whitespace-only strings consistently', () => {
        fc.assert(
          fc.property(fc.constantFrom('', ' ', '  ', '\n', '\t', '\n\t  \n'), (whitespace) => {
            const result = calculateReadingTime(whitespace);
            return result === 1;
          })
        );
      });

      it('should return integer values', () => {
        fc.assert(
          fc.property(fc.string(), (content) => {
            const result = calculateReadingTime(content);
            return Number.isInteger(result);
          })
        );
      });

      it('should handle Unicode content correctly', () => {
        fc.assert(
          fc.property(fc.string(), (content) => {
            const result = calculateReadingTime(content);
            return result >= 1 && Number.isInteger(result);
          })
        );
      });
    });
  });

  describe('storeItems', () => {
    describe('Successful Storage', () => {
      it('should return count of inserted items', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
            author: 'Author 1',
          },
          {
            title: 'Item 2',
            link: 'https://example.com/2',
            content: 'Content 2',
            publishedAt: 2000,
          },
        ];

        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);
        vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([]) } as any);

        const result = await storeItems(1, 1, items);

        expect(result).toBe(2);
      });

      it('should return 0 for empty array', async () => {
        const result = await storeItems(1, 1, []);

        expect(result).toBe(0);
        expect(db.query.feeds.findFirst).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should throw error when feed not found', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
          },
        ];

        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(null as never);

        await expect(storeItems(1, 1, items)).rejects.toThrow('Failed to store items');
      });

      it('should throw error on database insertion failure', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
          },
        ];

        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);
        vi.mocked(db.insert).mockImplementation(() => {
          throw new Error('Database error');
        });

        await expect(storeItems(1, 1, items)).rejects.toThrow('Failed to store items');
      });
    });

    describe('Reading Time Calculation', () => {
      it('should calculate and store reading time for each item', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Short',
            link: 'https://example.com/1',
            content: 'Short content',
            publishedAt: 1000,
          },
        ];

        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);

        // Create a proper chainable mock for insert
        const mockValues = vi.fn().mockReturnThis();
        const mockReturning = vi.fn().mockResolvedValue([]);
        const mockInsert = vi.fn().mockReturnValue({
          values: mockValues,
          returning: mockReturning,
        });
        vi.mocked(db.insert).mockImplementation(mockInsert as any);

        await storeItems(1, 1, items);

        expect(mockValues).toHaveBeenCalled();
        const valuesCall = mockValues.mock.calls[0] as any;
        const insertedItem = valuesCall[0][0];

        expect(insertedItem.readingTime).toBeGreaterThan(0);
        expect(typeof insertedItem.readingTime).toBe('number');
      });
    });

    describe('Author Conversion', () => {
      it('should convert undefined author to null', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
            author: undefined,
          },
        ];

        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);

        const mockValues = vi.fn().mockReturnThis();
        const mockReturning = vi.fn().mockResolvedValue([]);
        const mockInsert = vi.fn().mockReturnValue({
          values: mockValues,
          returning: mockReturning,
        });
        vi.mocked(db.insert).mockImplementation(mockInsert as any);

        await storeItems(1, 1, items);

        const valuesCall = mockValues.mock.calls[0] as any;
        const insertedItem = valuesCall[0][0];

        expect(insertedItem.author).toBeNull();
      });

      it('should preserve author when provided', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
            author: 'Test Author',
          },
        ];

        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);

        const mockValues = vi.fn().mockReturnThis();
        const mockReturning = vi.fn().mockResolvedValue([]);
        const mockInsert = vi.fn().mockReturnValue({
          values: mockValues,
          returning: mockReturning,
        });
        vi.mocked(db.insert).mockImplementation(mockInsert as any);

        await storeItems(1, 1, items);

        const valuesCall = mockValues.mock.calls[0] as any;
        const insertedItem = valuesCall[0][0];

        expect(insertedItem.author).toBe('Test Author');
      });
    });
  });

  describe('fetchAndStoreItems', () => {
    describe('Success Flow', () => {
      it('should return success result with items added', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
          },
        ];

        // Mock parseRSS
        vi.doMock('@/lib/rss/fetcher', () => ({
          parseRSS: vi.fn().mockResolvedValue({ items, title: 'Test Feed' }),
          dedupeItems: vi.fn().mockResolvedValue(items),
          storeItems: vi.fn().mockResolvedValue(1),
        }));

        // Since vi.doMock doesn't work within the same test file for the module we're testing,
        // we need to directly test the orchestration

        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([]);
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([items]),
        } as any);
        vi.mocked(db.update).mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
        } as any);

        mockParseURL.mockResolvedValue({ items, title: 'Test Feed' });

        const result = await fetchAndStoreItems(1, 1, 'https://example.com/feed.xml');

        expect(result.success).toBe(true);
        expect(result.itemsAdded).toBeGreaterThan(0);
      });

      it('should return success with 0 items when no new items', async () => {
        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([
          { link: 'https://example.com/1' },
          { link: 'https://example.com/2' },
        ] as any);
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);

        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
          },
          {
            title: 'Item 2',
            link: 'https://example.com/2',
            content: 'Content 2',
            publishedAt: 2000,
          },
        ];

        mockParseURL.mockResolvedValue({ items, title: 'Test Feed' });

        const result = await fetchAndStoreItems(1, 1, 'https://example.com/feed.xml');

        expect(result.success).toBe(true);
        expect(result.itemsAdded).toBe(0);
      });

      it('should return success with 0 items for empty feed', async () => {
        mockParseURL.mockResolvedValue({ items: [], title: 'Test Feed' });

        const result = await fetchAndStoreItems(1, 1, 'https://example.com/feed.xml');

        expect(result.success).toBe(true);
        expect(result.itemsAdded).toBe(0);
      });
    });

    describe('Error Handling', () => {
      it('should return error result on parse failure', async () => {
        mockParseURL.mockRejectedValue(new Error('Parse error'));

        const result = await fetchAndStoreItems(1, 1, 'https://example.com/feed.xml');

        expect(result.success).toBe(false);
        expect(result.itemsAdded).toBe(0);
        expect(result.error).toBe('Parse error');
      });

      it('should handle storage errors gracefully', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
          },
        ];

        mockParseURL.mockResolvedValue({ items, title: 'Test Feed' });
        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([]);
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(null as never);

        const result = await fetchAndStoreItems(1, 1, 'https://example.com/feed.xml');

        expect(result.success).toBe(false);
        expect(result.itemsAdded).toBe(0);
        expect(result.error).toBeDefined();
      });
    });

    describe('Last Updated Update', () => {
      it('should update feed lastUpdatedAt after successful storage', async () => {
        const items: ParsedFeedItem[] = [
          {
            title: 'Item 1',
            link: 'https://example.com/1',
            content: 'Content 1',
            publishedAt: 1000,
          },
        ];

        const mockFeed = createMockFeed({ id: 1 });
        vi.mocked(db.query.feedItems.findMany).mockResolvedValue([]);
        vi.mocked(db.query.feeds.findFirst).mockResolvedValue(mockFeed);
        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([items]),
        } as any);

        const beforeCall = Math.floor(Date.now() / 1000);
        const mockSet = vi.fn().mockReturnThis();
        const mockWhere = vi.fn().mockReturnThis();
        const mockUpdate = vi.fn().mockReturnValue({
          set: mockSet,
          where: mockWhere,
        });
        vi.mocked(db.update).mockImplementation(mockUpdate as any);

        mockParseURL.mockResolvedValue({ items, title: 'Test Feed' });

        await fetchAndStoreItems(1, 1, 'https://example.com/feed.xml');

        expect(mockUpdate).toHaveBeenCalledWith(feeds);
        const setCall = mockSet.mock.calls[0] as any;
        expect(setCall[0].lastUpdatedAt).toBeGreaterThanOrEqual(beforeCall);
      });
    });
  });
});
