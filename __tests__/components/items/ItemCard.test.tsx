import { render, screen } from '@testing-library/react';
import { FeedItem } from '@/lib/mock-data';
import ItemCard from '@/components/items/ItemCard';

// Mock the API
vi.mock('@/lib/mock-data', async () => {
  const actual = await vi.importActual('@/lib/mock-data');
  return {
    ...actual,
    markAsRead: vi.fn(),
    toggleFavorite: vi.fn(),
  };
});

describe('ItemCard', () => {
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
    render(<ItemCard item={mockItem} feedTitle="Test Feed" />);

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    expect(screen.getByText('Test Feed')).toBeInTheDocument();
    expect(screen.getByText('This is a test article content for preview purposes.')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('5 分钟')).toBeInTheDocument();
  });

  it('shows green dot when item is unread', () => {
    render(<ItemCard item={mockItem} />);

    const unreadDot = screen.getByRole('link').querySelector('.bg-green-500');
    expect(unreadDot).toBeInTheDocument();
  });

  it('does not show green dot when item is read', () => {
    const readItem = { ...mockItem, isRead: true };
    render(<ItemCard item={readItem} />);

    const unreadDot = screen.getByRole('link').querySelector('.bg-green-500');
    expect(unreadDot).not.toBeInTheDocument();
  });

  it('is clickable as a link', () => {
    render(<ItemCard item={mockItem} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/items/${mockItem.id}`);
  });

  it('renders read toggle button', () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByRole('button', { name: /未读/ })).toBeInTheDocument();
  });

  it('renders favorite button', () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByRole('button', { name: /收藏/ })).toBeInTheDocument();
  });

  it('displays "已读" when item is read', () => {
    const readItem = { ...mockItem, isRead: true };
    render(<ItemCard item={readItem} />);

    expect(screen.getByRole('button', { name: /已读/ })).toBeInTheDocument();
  });

  it('displays "已收藏" when item is favorited', () => {
    const favoritedItem = { ...mockItem, isFavorite: true };
    render(<ItemCard item={favoritedItem} />);

    expect(screen.getByRole('button', { name: /已收藏/ })).toBeInTheDocument();
  });

  it('renders without author when not provided', () => {
    const itemWithoutAuthor = { ...mockItem, author: undefined };
    render(<ItemCard item={itemWithoutAuthor} />);

    // Should not show author text
    expect(screen.queryByText('Test Author')).not.toBeInTheDocument();
  });

  it('renders without reading time when not provided', () => {
    const itemWithoutReadingTime = { ...mockItem, readingTime: undefined };
    render(<ItemCard item={itemWithoutReadingTime} />);

    // Should not show reading time
    expect(screen.queryByText('分钟')).not.toBeInTheDocument();
  });
});
