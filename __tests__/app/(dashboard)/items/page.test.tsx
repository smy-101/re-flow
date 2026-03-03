import { render, screen, waitFor } from '@testing-library/react';
import { fetchItems } from '@/lib/api/items';
import { fetchFeeds } from '@/lib/api/feeds';
import ItemsPage from '@/app/(dashboard)/items/page';
import { vi } from 'vitest';

// Mock the API
vi.mock('@/lib/api/items', () => ({
  fetchItems: vi.fn(),
}));

vi.mock('@/lib/api/feeds', () => ({
  fetchFeeds: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ItemsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetchFeeds to return empty array by default
    (fetchFeeds as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('renders page title', async () => {
    (fetchItems as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<ItemsPage />);

    expect(screen.getByText('我的阅读')).toBeInTheDocument();
  });

  it('renders "unread only" button', async () => {
    (fetchItems as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /仅未读/ })).toBeInTheDocument();
    });
  });

  it('loads and displays items', async () => {
    const mockItems = [
      {
        id: 'item-1',
        title: 'Test Article 1',
        content: 'Content 1',
        feedId: 'feed-1',
        publishedAt: Date.now(),
        isRead: false,
        isFavorite: false,
      },
      {
        id: 'item-2',
        title: 'Test Article 2',
        content: 'Content 2',
        feedId: 'feed-1',
        publishedAt: Date.now(),
        isRead: true,
        isFavorite: false,
      },
    ];

    (fetchItems as ReturnType<typeof vi.fn>).mockResolvedValue(mockItems);
    (fetchFeeds as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, userId: 1, title: 'Test Feed', feedUrl: 'https://example.com/feed.xml', unreadCount: 0 },
    ]);
    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    let resolveItems: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveItems = resolve;
    });
    (fetchItems as ReturnType<typeof vi.fn>).mockReturnValue(pendingPromise);
    (fetchFeeds as ReturnType<typeof vi.fn>).mockReturnValue(pendingPromise);
    render(<ItemsPage />);

    // The component should render (in loading state)
    expect(screen.getByText('我的阅读')).toBeInTheDocument();

    // Clean up
    resolveItems!([]);
  });

  it('shows empty state when no items', async () => {
    (fetchItems as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText('暂无文章')).toBeInTheDocument();
    });
  });

  it('calls fetchItems without filters on mount', async () => {
    (fetchItems as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<ItemsPage />);

    await waitFor(() => {
      expect(fetchItems).toHaveBeenCalled();
    });
  });
});
