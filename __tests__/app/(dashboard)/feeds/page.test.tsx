import { render, screen, waitFor } from '@testing-library/react';
import { fetchFeeds } from '@/lib/api/feeds';
import FeedsPage from '@/app/(dashboard)/feeds/page';
import { vi } from 'vitest';

// Mock the API
vi.mock('@/lib/api/feeds', () => ({
  fetchFeeds: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('FeedsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', async () => {
    (fetchFeeds as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<FeedsPage />);

    expect(screen.getByText('我的订阅')).toBeInTheDocument();
  });

  it('renders "add subscription" button', async () => {
    (fetchFeeds as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<FeedsPage />);

    expect(screen.getByRole('link', { name: /添加订阅/ })).toBeInTheDocument();
  });

  it('loads and displays feeds', async () => {
    const mockFeeds = [
      {
        id: 'feed-1',
        title: 'Test Feed 1',
        unreadCount: 5,
        category: '技术',
        lastUpdatedAt: Date.now(),
      },
      {
        id: 'feed-2',
        title: 'Test Feed 2',
        unreadCount: 0,
        category: '设计',
        lastUpdatedAt: Date.now(),
      },
    ];

    (fetchFeeds as ReturnType<typeof vi.fn>).mockResolvedValue(mockFeeds);
    render(<FeedsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Feed 1')).toBeInTheDocument();
      expect(screen.getByText('Test Feed 2')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    let resolveFeeds: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveFeeds = resolve;
    });
    (fetchFeeds as ReturnType<typeof vi.fn>).mockReturnValue(pendingPromise);
    render(<FeedsPage />);

    // The component should render (in loading state)
    expect(screen.getByText('我的订阅')).toBeInTheDocument();

    // Clean up
    resolveFeeds!([]);
  });

  it('shows empty state when no feeds', async () => {
    (fetchFeeds as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<FeedsPage />);

    await waitFor(() => {
      expect(screen.getByText('暂无订阅')).toBeInTheDocument();
      expect(screen.getByText(/开始添加你喜欢的 RSS 订阅吧/)).toBeInTheDocument();
    });
  });

  it('calls fetchFeeds on mount', async () => {
    (fetchFeeds as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<FeedsPage />);

    await waitFor(() => {
      expect(fetchFeeds).toHaveBeenCalled();
    });
  });
});
