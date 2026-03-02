import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ItemList from '@/components/items/ItemList';
import * as itemsApi from '@/lib/api/items';
import * as feedsApi from '@/lib/api/feeds';

// Mock the API modules
vi.mock('@/lib/api/items');
vi.mock('@/lib/api/feeds');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('ItemList', () => {
  const mockItems = [
    {
      id: 1,
      feedId: 1,
      title: 'Test Article 1',
      link: 'https://example.com/1',
      content: 'Content 1',
      publishedAt: Date.now(),
      isRead: false,
      isFavorite: false,
    },
    {
      id: 2,
      feedId: 1,
      title: 'Test Article 2',
      link: 'https://example.com/2',
      content: 'Content 2',
      publishedAt: Date.now() - 1000,
      isRead: true,
      isFavorite: false,
    },
  ];

  const mockFeeds = [
    { id: 1, title: 'Test Feed', feedUrl: 'https://example.com/rss' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and display items', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue(mockItems);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="all" />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });
  });

  it('should fetch unread items when filterStatus is "unread"', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue([mockItems[0]]);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="unread" />);

    await waitFor(() => {
      expect(itemsApi.fetchItems).toHaveBeenCalledWith({
        feedId: undefined,
        isRead: false,
        isFavorite: undefined,
      });
    });
  });

  it('should fetch read items when filterStatus is "read"', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue([mockItems[1]]);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="read" />);

    await waitFor(() => {
      expect(itemsApi.fetchItems).toHaveBeenCalledWith({
        feedId: undefined,
        isRead: true,
        isFavorite: undefined,
      });
    });
  });

  it('should fetch all items when filterStatus is "all"', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue(mockItems);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="all" />);

    await waitFor(() => {
      expect(itemsApi.fetchItems).toHaveBeenCalledWith({
        feedId: undefined,
        isRead: undefined,
        isFavorite: undefined,
      });
    });
  });

  it('should show empty state for unread items', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue([]);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="unread" />);

    await waitFor(() => {
      expect(screen.getByText('暂无未读文章')).toBeInTheDocument();
      expect(screen.getByText('太棒了！你已经读完所有文章')).toBeInTheDocument();
    });
  });

  it('should show empty state for read items', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue([]);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="read" />);

    await waitFor(() => {
      expect(screen.getByText('暂无已读文章')).toBeInTheDocument();
      expect(screen.getByText('还没有阅读过任何文章，去探索吧！')).toBeInTheDocument();
    });
  });

  it('should show mark all read button when showMarkAllRead is true and has unread items', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue([mockItems[0]]);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="unread" showMarkAllRead />);

    await waitFor(() => {
      expect(screen.getByText('🔥 全部标记为已读')).toBeInTheDocument();
    });
  });

  it('should not show mark all read button when filterStatus is not unread', async () => {
    vi.mocked(itemsApi.fetchItems).mockResolvedValue(mockItems);
    vi.mocked(feedsApi.fetchFeeds).mockResolvedValue(mockFeeds);

    render(<ItemList filterStatus="all" showMarkAllRead />);

    await waitFor(() => {
      expect(screen.queryByText('🔥 全部标记为已读')).not.toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    vi.mocked(itemsApi.fetchItems).mockImplementation(() => new Promise(() => {}));
    vi.mocked(feedsApi.fetchFeeds).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<ItemList filterStatus="all" />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
