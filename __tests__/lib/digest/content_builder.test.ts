import { describe, expect, it } from 'vitest';
import {
  buildDigestContent,
  type DigestContentInput,
  type DigestItem,
} from '@/lib/digest/content-builder';

describe('lib/digest/content_builder', () => {
  describe('buildDigestContent', () => {
    it('should return empty result when no items', () => {
      const input: DigestContentInput = {
        items: [],
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.hasContent).toBe(false);
      expect(result.itemCount).toBe(0);
      expect(result.htmlContent).toBe('');
    });

    it('should group items by feed category', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'Tech Article 1',
          link: 'https://example.com/tech/1',
          feedTitle: 'Tech Blog',
          feedCategory: 'Technology',
          publishedAt: 1773914400,
          readingTime: 5,
          aiProcessed: false,
        },
        {
          id: 2,
          title: 'Design Article 1',
          link: 'https://example.com/design/1',
          feedTitle: 'Design Blog',
          feedCategory: 'Design',
          publishedAt: 1773914400,
          readingTime: 3,
          aiProcessed: false,
        },
        {
          id: 3,
          title: 'Tech Article 2',
          link: 'https://example.com/tech/2',
          feedTitle: 'Another Tech Blog',
          feedCategory: 'Technology',
          publishedAt: 1773914400,
          readingTime: 8,
          aiProcessed: false,
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.hasContent).toBe(true);
      expect(result.itemCount).toBe(3);
      expect(result.groupedItems).toBeDefined();
      expect(result.groupedItems?.length).toBe(2);
      expect(result.groupedItems?.find((g) => g.category === 'Technology')?.items.length).toBe(2);
      expect(result.groupedItems?.find((g) => g.category === 'Design')?.items.length).toBe(1);
    });

    it('should group items without category as "Uncategorized"', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'Article without category',
          link: 'https://example.com/1',
          feedTitle: 'Some Blog',
          feedCategory: null,
          publishedAt: 1773914400,
          readingTime: 5,
          aiProcessed: false,
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.groupedItems?.find((g) => g.category === 'Uncategorized')).toBeDefined();
    });

    it('should include AI processing result when available', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'AI Summarized Article',
          link: 'https://example.com/1',
          feedTitle: 'Tech Blog',
          feedCategory: 'Technology',
          publishedAt: 1773914400,
          readingTime: 5,
          aiProcessed: true,
          aiOutput: 'This article discusses the future of AI...',
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.hasContent).toBe(true);
      expect(result.htmlContent).toContain('This article discusses the future of AI...');
    });

    it('should format simple item without AI processing', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'Simple Article',
          link: 'https://example.com/1',
          feedTitle: 'Tech Blog',
          feedCategory: 'Technology',
          publishedAt: 1773914400,
          readingTime: 5,
          aiProcessed: false,
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.htmlContent).toContain('Simple Article');
      expect(result.htmlContent).toContain('Tech Blog');
      expect(result.htmlContent).toContain('https://example.com/1');
      expect(result.htmlContent).not.toContain('AI Summary');
    });

    it('should include reading time for AI processed items', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'Long Article',
          link: 'https://example.com/1',
          feedTitle: 'Tech Blog',
          feedCategory: 'Technology',
          publishedAt: 1773914400,
          readingTime: 15,
          aiProcessed: true,
          aiOutput: 'Summary here...',
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.htmlContent).toContain('15');
      expect(result.htmlContent).toContain('min');
    });

    it('should include header with date and item count', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'Article 1',
          link: 'https://example.com/1',
          feedTitle: 'Blog',
          feedCategory: 'Tech',
          publishedAt: 1773914400,
          readingTime: 5,
          aiProcessed: false,
        },
        {
          id: 2,
          title: 'Article 2',
          link: 'https://example.com/2',
          feedTitle: 'Blog',
          feedCategory: 'Tech',
          publishedAt: 1773914400,
          readingTime: 3,
          aiProcessed: false,
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.htmlContent).toContain('Re:Flow');
      expect(result.htmlContent).toContain('2');
    });

    it('should include footer with unsubscribe link', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'Article',
          link: 'https://example.com/1',
          feedTitle: 'Blog',
          feedCategory: 'Tech',
          publishedAt: 1773914400,
          readingTime: 5,
          aiProcessed: false,
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
        unsubscribeUrl: 'https://app.example.com/settings/digest?unsubscribe=token123',
      };

      const result = buildDigestContent(input);

      expect(result.htmlContent).toContain('unsubscribe');
      expect(result.htmlContent).toContain('https://app.example.com/settings/digest?unsubscribe=token123');
    });

    it('should add UTM parameters to article links', () => {
      const items: DigestItem[] = [
        {
          id: 1,
          title: 'Article',
          link: 'https://example.com/article',
          feedTitle: 'Blog',
          feedCategory: 'Tech',
          publishedAt: 1773914400,
          readingTime: 5,
          aiProcessed: false,
        },
      ];

      const input: DigestContentInput = {
        items,
        timezone: 'UTC',
        frequency: 'daily',
      };

      const result = buildDigestContent(input);

      expect(result.htmlContent).toContain('utm_source=email');
      expect(result.htmlContent).toContain('utm_medium=digest');
      expect(result.htmlContent).toContain('utm_campaign=rss');
    });
  });
});
