import { render, screen } from '@testing-library/react';
import { FeedItem } from '@/lib/api/items';
import ItemCard from '@/components/items/ItemCard';
import { FavoriteProvider } from '@/lib/context/FavoriteContext';

// Mock API
vi.mock('@/lib/api/items', () => ({
  markAsRead: vi.fn(),
  toggleFavorite: vi.fn(),
  fetchFavoriteCount: vi.fn(() => Promise.resolve({ count: 0 })),
}));

describe('ItemCard', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<FavoriteProvider>{ui}</FavoriteProvider>);
  };

  const mockItem: FeedItem = {
    id: 'item-1',
    feedId: 'feed-1',
    title: 'Test Article Title',
    link: 'https://example.com/article',
    content: 'This is a test article content for preview purposes.',
    publishedAt: Date.now(),
    isRead: false,
    isFavorite: false,
    author: 'Test Author',
    readingTime: 5,
  };

  it('renders item information correctly', () => {
    renderWithProvider(<ItemCard item={mockItem} feedTitle="Test Feed" />);

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.getByText('Test Feed')).toBeInTheDocument();
    expect(screen.getByText('This is a test article content for preview purposes.')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('5 分钟')).toBeInTheDocument();
  });

  it('shows green dot when item is unread', () => {
    renderWithProvider(<ItemCard item={mockItem} />);

    const unreadDot = screen.getByRole('link').querySelector('.bg-green-500');
    expect(unreadDot).toBeInTheDocument();
  });

  it('does not show green dot when item is read', () => {
    const readItem = { ...mockItem, isRead: true };
    renderWithProvider(<ItemCard item={readItem} />);

    const unreadDot = screen.getByRole('link').querySelector('.bg-green-500');
    expect(unreadDot).not.toBeInTheDocument();
  });

  it('is clickable as a link', () => {
    renderWithProvider(<ItemCard item={mockItem} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/items/${mockItem.id}`);
  });

  it('renders read toggle button', () => {
    renderWithProvider(<ItemCard item={mockItem} />);

    expect(screen.getByRole('button', { name: /未读/ })).toBeInTheDocument();
  });

  it('renders favorite button', () => {
    renderWithProvider(<ItemCard item={mockItem} />);

    expect(screen.getByRole('button', { name: /收藏/ })).toBeInTheDocument();
  });

  it('displays "已读" when item is read', () => {
    const readItem = { ...mockItem, isRead: true };
    renderWithProvider(<ItemCard item={readItem} />);

    expect(screen.getByRole('button', { name: /已读/ })).toBeInTheDocument();
  });

  it('displays "已收藏" when item is favorited', () => {
    const favoritedItem = { ...mockItem, isFavorite: true };
    renderWithProvider(<ItemCard item={favoritedItem} />);

    expect(screen.getByRole('button', { name: /已收藏/ })).toBeInTheDocument();
  });

  it('renders without author when not provided', () => {
    const itemWithoutAuthor = { ...mockItem, author: undefined };
    renderWithProvider(<ItemCard item={itemWithoutAuthor} />);

    // Should not show author text
    expect(screen.queryByText('Test Author')).not.toBeInTheDocument();
  });

  it('renders without reading time when not provided', () => {
    const itemWithoutReadingTime = { ...mockItem, readingTime: undefined };
    renderWithProvider(<ItemCard item={itemWithoutReadingTime} />);

    // Should not show reading time
    expect(screen.queryByText('分钟')).not.toBeInTheDocument();
  });
});
