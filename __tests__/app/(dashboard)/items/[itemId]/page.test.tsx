import { render, screen, waitFor } from '@testing-library/react';
import * as navigation from 'next/navigation';
import type { FeedItem } from '@/lib/db/schema';
import type { Feed } from '@/lib/api/feeds';
import { fetchItemById, fetchItems, markAsRead } from '@/lib/api/items';
import { fetchFeedById } from '@/lib/api/feeds';
import ItemDetailPage from '@/app/(dashboard)/items/[itemId]/page';

// Mock the API functions
vi.mock('@/lib/api/items', async () => ({
  fetchItemById: vi.fn(),
  fetchItems: vi.fn(),
  markAsRead: vi.fn(),
}));

vi.mock('@/lib/api/feeds', async () => ({
  fetchFeedById: vi.fn(),
}));

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('ItemDetailPage', () => {
  const mockPush = vi.fn();
  const mockBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();

    // Setup default router mock
    vi.mocked(navigation.useRouter).mockReturnValue({
      push: mockPush,
      back: mockBack,
    } as unknown as ReturnType<typeof navigation.useRouter>);
  });

  const setupMocks = (itemId: string, item: FeedItem | null, items: FeedItem[], feed: Feed | null) => {
    vi.mocked(navigation.useParams).mockReturnValue({ itemId });
    vi.mocked(fetchItemById).mockResolvedValue(item);
    vi.mocked(fetchItems).mockResolvedValue(items);
    vi.mocked(fetchFeedById).mockResolvedValue(feed);
    vi.mocked(markAsRead).mockResolvedValue(item);
  };

  describe('Article Loading', () => {
    it('renders article content when article exists', async () => {
      const mockItem = {
        id: 1,
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content here',
        publishedAt: Date.now(),
        isRead: false,
        isFavorite: false,
      };

      const mockFeed = {
        id: 1,
        userId: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed',
        description: 'Test feed description',
        category: 'tech',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        unreadCount: 0,
      };

      const mockItems = [mockItem];

      setupMocks('1', mockItem, mockItems, mockFeed);

      render(<ItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });
    });

    it('shows error message when article does not exist', async () => {
      setupMocks('999', null, [], null);

      render(<ItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('文章不存在')).toBeInTheDocument();
      });
    });

    it('shows loading spinner while loading', () => {
      vi.mocked(navigation.useParams).mockReturnValue({ itemId: '1' });
      vi.mocked(fetchItemById).mockImplementation(() => new Promise(() => {}));

      render(<ItemDetailPage />);

      // Check for loading spinner by looking for the animate-spin class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Auto-mark as Read', () => {
    it('calls markAsRead when loading an unread article', async () => {
      const mockItem = {
        id: 1,
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content',
        publishedAt: Date.now(),
        isRead: false,
        isFavorite: false,
      };

      const mockFeed = {
        id: 1,
        userId: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed',
        description: 'Test feed description',
        category: 'tech',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        unreadCount: 0,
      };

      setupMocks('1', mockItem, [mockItem], mockFeed);

      render(<ItemDetailPage />);

      await waitFor(() => {
        expect(markAsRead).toHaveBeenCalledWith('1', true);
      });
    });

    it('does not call markAsRead when article is already read', async () => {
      const mockItem = {
        id: 1,
        feedId: 1,
        title: 'Test Article',
        link: 'https://example.com/article',
        content: 'Article content',
        publishedAt: Date.now(),
        isRead: true,
        isFavorite: false,
      };

      const mockFeed = {
        id: 1,
        userId: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed',
        description: 'Test feed description',
        category: 'tech',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        unreadCount: 0,
      };

      setupMocks('1', mockItem, [mockItem], mockFeed);

      render(<ItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      expect(markAsRead).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('navigates to previous article when previous button is clicked', async () => {
      const mockItems = [
        {
          id: 1,
          feedId: 1,
          title: 'Article 1',
          link: 'https://example.com/1',
          content: 'Content 1',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
        {
          id: 2,
          feedId: 1,
          title: 'Article 2',
          link: 'https://example.com/2',
          content: 'Content 2',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
      ];

      const mockFeed = {
        id: 1,
        userId: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed',
        description: 'Test feed description',
        category: 'tech',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        unreadCount: 0,
      };

      setupMocks('2', mockItems[1], mockItems, mockFeed);

      render(<ItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Article 2')).toBeInTheDocument();
      });

      // Click previous button - button is enabled since we're on article 2 (index 1)
      const previousButton = screen.getByRole('button', { name: /上一篇/ });
      previousButton.click();

      expect(mockPush).toHaveBeenCalledWith('/items/1');
    });

    it('navigates to next article when next button is clicked', async () => {
      const mockItems = [
        {
          id: 1,
          feedId: 1,
          title: 'Article 1',
          link: 'https://example.com/1',
          content: 'Content 1',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
        {
          id: 2,
          feedId: 1,
          title: 'Article 2',
          link: 'https://example.com/2',
          content: 'Content 2',
          publishedAt: Date.now(),
          isRead: false,
          isFavorite: false,
        },
      ];

      const mockFeed = {
        id: 1,
        userId: 1,
        title: 'Test Feed',
        feedUrl: 'https://example.com/feed',
        description: 'Test feed description',
        category: 'tech',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        unreadCount: 0,
      };

      setupMocks('1', mockItems[0], mockItems, mockFeed);

      render(<ItemDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Article 1')).toBeInTheDocument();
      });

      // Click next button - button is enabled since we're on article 1 (index 0)
      const nextButton = screen.getByRole('button', { name: /下一篇/ });
      nextButton.click();

      expect(mockPush).toHaveBeenCalledWith('/items/2');
    });
  });
});
