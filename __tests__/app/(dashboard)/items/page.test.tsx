import { render, screen, waitFor } from '@testing-library/react';
import { fetchItems } from '@/lib/mock-data';
import ItemsPage from '@/app/(dashboard)/items/page';

// Mock the API
vi.mock('@/lib/mock-data', async () => {
  const actual = await vi.importActual('@/lib/mock-data');
  return {
    ...actual,
    fetchItems: vi.fn(),
    fetchFeeds: vi.fn(),
  };
});

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ItemsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    (fetchItems as jest.Mock).mockResolvedValue([]);
    render(<ItemsPage />);

    expect(screen.getByText('我的阅读')).toBeInTheDocument();
  });

  it('renders "unread only" button', () => {
    (fetchItems as jest.Mock).mockResolvedValue([]);
    render(<ItemsPage />);

    expect(screen.getByRole('link', { name: /仅未读/ })).toBeInTheDocument();
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

    (fetchItems as jest.Mock).mockResolvedValue(mockItems);
    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Article 1')).toBeInTheDocument();
      expect(screen.getByText('Test Article 2')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (fetchItems as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<ItemsPage />);

    // Should show loading spinner
    expect(screen.queryByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when no items', async () => {
    (fetchItems as jest.Mock).mockResolvedValue([]);
    render(<ItemsPage />);

    await waitFor(() => {
      expect(screen.getByText('暂无文章')).toBeInTheDocument();
    });
  });

  it('calls fetchItems without filters on mount', () => {
    (fetchItems as jest.Mock).mockResolvedValue([]);
    render(<ItemsPage />);

    expect(fetchItems).toHaveBeenCalledWith(undefined);
  });
});
