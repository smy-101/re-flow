import { render, screen, waitFor } from '@testing-library/react';
import { fetchFeeds } from '@/lib/mock-data';
import FeedsPage from '@/app/(dashboard)/feeds/page';

// Mock the API
vi.mock('@/lib/mock-data', async () => {
  const actual = await vi.importActual('@/lib/mock-data');
  return {
    ...actual,
    fetchFeeds: vi.fn(),
  };
});

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

  it('renders page title', () => {
    (fetchFeeds as jest.Mock).mockResolvedValue([]);
    render(<FeedsPage />);

    expect(screen.getByText('我的订阅')).toBeInTheDocument();
  });

  it('renders "add subscription" button', () => {
    (fetchFeeds as jest.Mock).mockResolvedValue([]);
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

    (fetchFeeds as jest.Mock).mockResolvedValue(mockFeeds);
    render(<FeedsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Feed 1')).toBeInTheDocument();
      expect(screen.getByText('Test Feed 2')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (fetchFeeds as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<FeedsPage />);

    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no feeds', async () => {
    (fetchFeeds as jest.Mock).mockResolvedValue([]);
    render(<FeedsPage />);

    await waitFor(() => {
      expect(screen.getByText('暂无订阅')).toBeInTheDocument();
      expect(screen.getByText(/开始添加你喜欢的 RSS 订阅吧/)).toBeInTheDocument();
    });
  });

  it('calls fetchFeeds on mount', () => {
    (fetchFeeds as jest.Mock).mockResolvedValue([]);
    render(<FeedsPage />);

    expect(fetchFeeds).toHaveBeenCalled();
  });
});
