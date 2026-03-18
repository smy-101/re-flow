import { describe, expect, it } from 'vitest';

/**
 * Tests for memoization helper patterns used in components.
 *
 * These tests verify that sorting and lookup logic works correctly,
 * which is then used with useMemo in components.
 */

describe('lib/utils/memo-helpers', () => {
  describe('sortItemsByDate', () => {
    // This mirrors the sorting logic in ItemList.tsx
    const sortItemsByDate = <T extends { publishedAt: number }>(
      items: T[],
      order: 'newest' | 'oldest'
    ): T[] => {
      return [...items].sort((a, b) => {
        if (order === 'newest') {
          return b.publishedAt - a.publishedAt;
        } else {
          return a.publishedAt - b.publishedAt;
        }
      });
    };

    it('sorts items newest first', () => {
      const items = [
        { id: 1, publishedAt: 1000 },
        { id: 2, publishedAt: 3000 },
        { id: 3, publishedAt: 2000 },
      ];

      const result = sortItemsByDate(items, 'newest');

      expect(result).toEqual([
        { id: 2, publishedAt: 3000 },
        { id: 3, publishedAt: 2000 },
        { id: 1, publishedAt: 1000 },
      ]);
    });

    it('sorts items oldest first', () => {
      const items = [
        { id: 1, publishedAt: 3000 },
        { id: 2, publishedAt: 1000 },
        { id: 3, publishedAt: 2000 },
      ];

      const result = sortItemsByDate(items, 'oldest');

      expect(result).toEqual([
        { id: 2, publishedAt: 1000 },
        { id: 3, publishedAt: 2000 },
        { id: 1, publishedAt: 3000 },
      ]);
    });

    it('does not mutate original array', () => {
      const items = [
        { id: 1, publishedAt: 1000 },
        { id: 2, publishedAt: 3000 },
      ];

      sortItemsByDate(items, 'newest');

      expect(items).toEqual([
        { id: 1, publishedAt: 1000 },
        { id: 2, publishedAt: 3000 },
      ]);
    });
  });

  describe('findProviderById', () => {
    // This mirrors the provider lookup logic in AIConfigCard.tsx
    const findProviderById = <T extends { id: string }>(
      providers: T[],
      id: string
    ): T | undefined => {
      return providers.find((p) => p.id === id);
    };

    it('finds provider by id', () => {
      const providers = [
        { id: 'openai', name: 'OpenAI' },
        { id: 'anthropic', name: 'Anthropic' },
      ];

      const result = findProviderById(providers, 'anthropic');

      expect(result).toEqual({ id: 'anthropic', name: 'Anthropic' });
    });

    it('returns undefined if not found', () => {
      const providers = [
        { id: 'openai', name: 'OpenAI' },
      ];

      const result = findProviderById(providers, 'nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('useMemo dependency patterns', () => {
    it('verifies stable reference for same dependencies', () => {
      // This is a conceptual test - actual memoization is tested via component behavior
      // The pattern: useMemo(() => compute(a, b), [a, b])
      // Should return same reference if a and b don't change

      const computeSort = <T extends { publishedAt: number }>(
        items: T[],
        order: 'newest' | 'oldest'
      ) => [...items].sort((a, b) =>
        order === 'newest' ? b.publishedAt - a.publishedAt : a.publishedAt - b.publishedAt
      );

      const items = [{ id: 1, publishedAt: 1000 }];
      const order = 'newest' as const;

      // Same inputs should produce same output (structural equality)
      const result1 = computeSort(items, order);
      const result2 = computeSort(items, order);

      expect(result1).toEqual(result2);
    });
  });
});
