import { describe, expect, it } from 'vitest';
import {
  buildArticleCompositeView,
  MCP_RAW_FALLBACK_MAX_CHARS,
} from '@/lib/mcp/article-view';

const baseItem = {
  id: 101,
  feedId: 8,
  title: 'A composite article',
  link: 'https://example.com/articles/101',
  content: 'raw content',
  publishedAt: 1_700_000_000,
  author: 'Author',
};

describe('lib/mcp/article-view', () => {
  it('prefers the latest successful processing result', () => {
    const composite = buildArticleCompositeView({
      item: baseItem,
      feedTitle: 'Example Feed',
      processingResults: [
        {
          id: 1,
          status: 'done',
          output: 'older success',
          errorMessage: null,
          createdAt: 100,
          completedAt: 120,
        },
        {
          id: 2,
          status: 'done',
          output: 'latest success',
          errorMessage: null,
          createdAt: 200,
          completedAt: 240,
        },
      ],
      allowRawFallback: true,
    });

    expect(composite.sourceType).toBe('processed');
    expect(composite.content).toBe('latest success');
    expect(composite.processingStatus).toBe('done');
  });

  it('falls back to raw content for pending processing while preserving state', () => {
    const composite = buildArticleCompositeView({
      item: {
        ...baseItem,
        content: 'pending raw body',
      },
      feedTitle: 'Example Feed',
      processingResults: [
        {
          id: 3,
          status: 'pending',
          output: null,
          errorMessage: null,
          createdAt: 333,
          completedAt: null,
        },
      ],
      allowRawFallback: true,
    });

    expect(composite.sourceType).toBe('raw-fallback');
    expect(composite.content).toBe('pending raw body');
    expect(composite.processingStatus).toBe('pending');
    expect(composite.retryable).toBe(true);
    expect(composite.lastAttemptAt).toBe(333);
  });

  it('trims raw fallback content and maps error metadata', () => {
    const composite = buildArticleCompositeView({
      item: {
        ...baseItem,
        content: 'x'.repeat(MCP_RAW_FALLBACK_MAX_CHARS + 120),
      },
      feedTitle: 'Example Feed',
      processingResults: [
        {
          id: 4,
          status: 'error',
          output: null,
          errorMessage: 'request timeout while contacting upstream model',
          createdAt: 444,
          completedAt: 555,
        },
      ],
      allowRawFallback: true,
    });

    expect(composite.sourceType).toBe('raw-fallback');
    expect(composite.content).toHaveLength(MCP_RAW_FALLBACK_MAX_CHARS + 3);
    expect(composite.processingStatus).toBe('error');
    expect(composite.errorType).toBe('transient');
    expect(composite.retryable).toBe(true);
    expect(composite.lastAttemptAt).toBe(555);
  });
});
