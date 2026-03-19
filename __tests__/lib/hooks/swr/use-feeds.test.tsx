import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { useFeeds, useFeed } from '@/lib/hooks/swr/use-feeds';

// Mock the API functions
vi.mock('@/lib/api/feeds', () => ({
  fetchFeeds: vi.fn(),
  fetchFeedById: vi.fn(),
}));

const mockFeeds = [
  {
    id: 1,
    title: 'Feed 1',
    feedUrl: 'https://example.com/feed1.xml',
    siteUrl: 'https://example.com',
    description: 'Test feed 1',
    category: 'Tech',
    userId: 1,
    pipelineId: null,
    templateId: null,
    autoProcess: false,
    lastUpdatedAt: 1000,
    createdAt: 1000,
    updatedAt: 1000,
    unreadCount: 5,
  },
  {
    id: 2,
    title: 'Feed 2',
    feedUrl: 'https://example.com/feed2.xml',
    siteUrl: 'https://example2.com',
    description: 'Test feed 2',
    category: 'News',
    userId: 1,
    pipelineId: null,
    templateId: null,
    autoProcess: false,
    lastUpdatedAt: 1000,
    createdAt: 1000,
    updatedAt: 1000,
    unreadCount: 3,
  },
];

describe('useFeeds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return feeds on successful fetch', async () => {
    const { fetchFeeds } = await import('@/lib/api/feeds');
    vi.mocked(fetchFeeds).mockResolvedValue(mockFeeds);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useFeeds(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.feeds).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.feeds).toEqual(mockFeeds);
    expect(result.current.isError).toBe(false);
  });

  it('should handle fetch errors', async () => {
    const { fetchFeeds } = await import('@/lib/api/feeds');
    vi.mocked(fetchFeeds).mockRejectedValue(new Error('Failed to fetch'));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useFeeds(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.feeds).toEqual([]);
    expect(result.current.error).toBeDefined();
  });
});

describe('useFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a single feed on successful fetch', async () => {
    const { fetchFeedById } = await import('@/lib/api/feeds');
    vi.mocked(fetchFeedById).mockResolvedValue(mockFeeds[0]);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useFeed(1), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.feed).toEqual(mockFeeds[0]);
    expect(result.current.isError).toBe(false);
  });

  it('should not fetch when feedId is null', async () => {
    const { fetchFeedById } = await import('@/lib/api/feeds');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useFeed(null), { wrapper });

    // Should not be loading when no feedId
    expect(result.current.feed).toBeUndefined();
    expect(fetchFeedById).not.toHaveBeenCalled();
  });
});
