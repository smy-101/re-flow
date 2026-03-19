import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { useItems, useItem } from '@/lib/hooks/swr/use-items';

// Mock the API functions
vi.mock('@/lib/api/items', () => ({
  fetchItems: vi.fn(),
  fetchItemById: vi.fn(),
}));

const mockItems = [
  {
    id: 1,
    title: 'Item 1',
    link: 'https://example.com/item1',
    feedId: 1,
    userId: 1,
    content: 'Content for item 1',
    isRead: false,
    isFavorite: false,
    publishedAt: 1000,
    author: 'Author 1',
    readingTime: 5,
    createdAt: 1000,
  },
  {
    id: 2,
    title: 'Item 2',
    link: 'https://example.com/item2',
    feedId: 1,
    userId: 1,
    content: 'Content for item 2',
    isRead: true,
    isFavorite: false,
    publishedAt: 2000,
    author: 'Author 2',
    readingTime: 3,
    createdAt: 2000,
  },
];

describe('useItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return items on successful fetch', async () => {
    const { fetchItems } = await import('@/lib/api/items');
    vi.mocked(fetchItems).mockResolvedValue(mockItems);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useItems(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.isError).toBe(false);
  });

  it('should pass filter options to fetchItems', async () => {
    const { fetchItems } = await import('@/lib/api/items');
    vi.mocked(fetchItems).mockResolvedValue(mockItems);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    renderHook(() => useItems({ feedId: '1', isRead: false }), { wrapper });

    await waitFor(() => {
      expect(fetchItems).toHaveBeenCalledWith({ feedId: '1', isRead: false });
    });
  });

  it('should handle fetch errors', async () => {
    const { fetchItems } = await import('@/lib/api/items');
    vi.mocked(fetchItems).mockRejectedValue(new Error('Failed to fetch'));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useItems(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.items).toEqual([]);
  });
});

describe('useItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a single item on successful fetch', async () => {
    const { fetchItemById } = await import('@/lib/api/items');
    vi.mocked(fetchItemById).mockResolvedValue(mockItems[0]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useItem(1), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.item).toEqual(mockItems[0]);
    expect(result.current.isError).toBe(false);
  });

  it('should not fetch when itemId is null', async () => {
    const { fetchItemById } = await import('@/lib/api/items');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useItem(null), { wrapper });

    expect(result.current.item).toBeUndefined();
    expect(fetchItemById).not.toHaveBeenCalled();
  });

  it('should work with string itemId', async () => {
    const { fetchItemById } = await import('@/lib/api/items');
    vi.mocked(fetchItemById).mockResolvedValue(mockItems[0]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useItem('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.item).toEqual(mockItems[0]);
  });
});
