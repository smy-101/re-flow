import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import {
  useCreateFeed,
  useUpdateFeed,
  useDeleteFeed,
  useMarkAllAsRead,
} from '@/lib/hooks/swr/use-mutations';

// Mock the API functions
vi.mock('@/lib/api/feeds', () => ({
  createFeed: vi.fn(),
  updateFeed: vi.fn(),
  deleteFeed: vi.fn(),
  refreshFeed: vi.fn(),
}));

vi.mock('@/lib/api/items', () => ({
  markAsRead: vi.fn(),
  toggleFavorite: vi.fn(),
  markAllAsRead: vi.fn(),
}));

vi.mock('swr', async () => {
  const actual = await vi.importActual('swr');
  return {
    ...actual,
    mutate: vi.fn(),
  };
});

const mockFeed = {
  id: 1,
  title: 'Test Feed',
  feedUrl: 'https://example.com/feed.xml',
  siteUrl: 'https://example.com',
  description: 'A test feed',
  category: 'Tech',
  userId: 1,
  pipelineId: null,
  templateId: null,
  autoProcess: false,
  lastUpdatedAt: 1000,
  createdAt: 1000,
  updatedAt: 1000,
  unreadCount: 5,
};

describe('useCreateFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a feed and return result', async () => {
    const { createFeed } = await import('@/lib/api/feeds');
    vi.mocked(createFeed).mockResolvedValue(mockFeed);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCreateFeed(), { wrapper });

    expect(result.current.isMutating).toBe(false);

    // Trigger the mutation
    result.current.trigger({ feedUrl: 'https://example.com/feed.xml' });

    await waitFor(() => {
      expect(createFeed).toHaveBeenCalledWith({ feedUrl: 'https://example.com/feed.xml' });
    });
  });
});

describe('useUpdateFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update a feed', async () => {
    const { updateFeed } = await import('@/lib/api/feeds');
    vi.mocked(updateFeed).mockResolvedValue(mockFeed);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useUpdateFeed(1), { wrapper });

    result.current.trigger({ feedId: 1, data: { title: 'Updated Title' } });

    await waitFor(() => {
      expect(updateFeed).toHaveBeenCalledWith(1, { title: 'Updated Title' });
    });
  });
});

describe('useDeleteFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a feed', async () => {
    const { deleteFeed } = await import('@/lib/api/feeds');
    vi.mocked(deleteFeed).mockResolvedValue(true);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useDeleteFeed(), { wrapper });

    result.current.trigger(1);

    await waitFor(() => {
      expect(deleteFeed).toHaveBeenCalledWith(1);
    });
  });
});

describe('useMarkAllAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark all items as read', async () => {
    const { markAllAsRead } = await import('@/lib/api/items');
    vi.mocked(markAllAsRead).mockResolvedValue({ success: true, count: 5 });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useMarkAllAsRead(), { wrapper });

    result.current.trigger(undefined);

    await waitFor(() => {
      expect(markAllAsRead).toHaveBeenCalledWith(undefined);
    });
  });
});
