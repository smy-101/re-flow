import { describe, it, expect } from 'vitest';
import {
  renderPrompt,
  createPromptContext,
  validateTemplate,
  type PromptContext,
} from '@/lib/processing/prompt-renderer';
import type { FeedItem, Feed } from '@/lib/db/schema';

// Mock data
const mockFeed: Feed = {
  id: 1,
  userId: 1,
  title: 'Test Feed',
  feedUrl: 'https://example.com/feed.xml',
  siteUrl: 'https://example.com',
  description: 'A test feed',
  category: 'tech',
  createdAt: 1640995200,
  lastUpdatedAt: 1640995200,
};

const mockFeedItem: FeedItem = {
  id: 1,
  feedId: 1,
  userId: 1,
  title: 'Test Article',
  link: 'https://example.com/article/1',
  content: '<p>This is the article content.</p>',
  publishedAt: 1640995200,
  isRead: false,
  isFavorite: false,
  author: 'John Doe',
  readingTime: 5,
  createdAt: 1640995200,
};

describe('lib/processing/prompt-renderer', () => {
  describe('createPromptContext', () => {
    it('should create context from feed item and feed', () => {
      const context = createPromptContext(mockFeedItem, mockFeed);

      expect(context.title).toBe('Test Article');
      expect(context.content).toBe('<p>This is the article content.</p>');
      expect(context.author).toBe('John Doe');
      expect(context.link).toBe('https://example.com/article/1');
      expect(context.publishedAt).toBe(1640995200);
      expect(context.readingTime).toBe(5);
      expect(context.feedTitle).toBe('Test Feed');
      expect(context.feedUrl).toBe('https://example.com/feed.xml');
      expect(context.prevOutput).toBeUndefined();
    });

    it('should include prevOutput when provided', () => {
      const context = createPromptContext(
        mockFeedItem,
        mockFeed,
        'Previous step output',
      );

      expect(context.prevOutput).toBe('Previous step output');
    });

    it('should handle null author', () => {
      const itemWithoutAuthor = { ...mockFeedItem, author: null };
      const context = createPromptContext(itemWithoutAuthor, mockFeed);

      expect(context.author).toBeNull();
    });

    it('should handle null readingTime', () => {
      const itemWithoutReadingTime = { ...mockFeedItem, readingTime: null };
      const context = createPromptContext(itemWithoutReadingTime, mockFeed);

      expect(context.readingTime).toBeNull();
    });
  });

  describe('renderPrompt', () => {
    it('should render title variable', () => {
      const template = 'Title: {{title}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Title: Test Article');
    });

    it('should render content variable', () => {
      const template = 'Content: {{content}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Content: <p>This is the article content.</p>');
    });

    it('should render author variable', () => {
      const template = 'Author: {{author}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Author: John Doe');
    });

    it('should render "Unknown Author" when author is null', () => {
      const template = 'Author: {{author}}';
      const itemWithoutAuthor = { ...mockFeedItem, author: null };
      const context = createPromptContext(itemWithoutAuthor, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Author: Unknown Author');
    });

    it('should render link variable', () => {
      const template = 'Link: {{link}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Link: https://example.com/article/1');
    });

    it('should render publishedAt variable', () => {
      const template = 'Published: {{publishedAt}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      // Just check it renders something
      expect(result).toContain('Published:');
      expect(result).not.toContain('{{publishedAt}}');
    });

    it('should render readingTime variable', () => {
      const template = 'Reading time: {{readingTime}} minutes';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Reading time: 5 minutes');
    });

    it('should render "Unknown" when readingTime is null', () => {
      const template = 'Reading time: {{readingTime}} minutes';
      const itemWithoutReadingTime = { ...mockFeedItem, readingTime: null };
      const context = createPromptContext(itemWithoutReadingTime, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Reading time: Unknown minutes');
    });

    it('should render feedTitle variable', () => {
      const template = 'Feed: {{feedTitle}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Feed: Test Feed');
    });

    it('should render feedUrl variable', () => {
      const template = 'Feed URL: {{feedUrl}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Feed URL: https://example.com/feed.xml');
    });

    it('should render prev_output variable when provided', () => {
      const template = 'Previous: {{prev_output}}';
      const context = createPromptContext(mockFeedItem, mockFeed, 'Previous result');

      const result = renderPrompt(template, context);

      expect(result).toBe('Previous: Previous result');
    });

    it('should not replace prev_output when not provided', () => {
      const template = 'Previous: {{prev_output}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Previous: {{prev_output}}');
    });

    it('should render multiple variables in same template', () => {
      const template = 'Title: {{title}}\nAuthor: {{author}}\nContent: {{content}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe(
        'Title: Test Article\nAuthor: John Doe\nContent: <p>This is the article content.</p>',
      );
    });

    it('should replace all occurrences of same variable', () => {
      const template = '{{title}} - {{title}}';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe('Test Article - Test Article');
    });

    it('should handle template with no variables', () => {
      const template = 'This is a static template with no variables.';
      const context = createPromptContext(mockFeedItem, mockFeed);

      const result = renderPrompt(template, context);

      expect(result).toBe(template);
    });
  });

  describe('validateTemplate', () => {
    it('should return empty array for valid context', () => {
      const template = 'Title: {{title}}, Author: {{author}}';
      const context: Partial<PromptContext> = {
        title: 'Test',
        author: 'John',
      };

      const missing = validateTemplate(template, context);

      expect(missing).toEqual([]);
    });

    it('should return missing variables', () => {
      const template = 'Title: {{title}}, Author: {{author}}, Missing: {{unknownVar}}';
      const context: Partial<PromptContext> = {
        title: 'Test',
      };

      const missing = validateTemplate(template, context);

      expect(missing).toContain('author');
      expect(missing).toContain('unknownVar');
    });

    it('should handle template with no variables', () => {
      const template = 'No variables here';
      const context: Partial<PromptContext> = {};

      const missing = validateTemplate(template, context);

      expect(missing).toEqual([]);
    });

    it('should not duplicate missing variables', () => {
      const template = '{{title}} and {{title}}';
      const context: Partial<PromptContext> = {};

      const missing = validateTemplate(template, context);

      expect(missing).toEqual(['title']);
    });
  });
});
