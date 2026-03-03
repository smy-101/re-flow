import { render, screen } from '@testing-library/react';
import { Feed } from '@/lib/api/feeds';
import FeedCard from '@/components/feeds/FeedCard';

describe('FeedCard', () => {
  const mockFeed: Feed = {
    id: 'feed-1',
    userId: 'user-1',
    title: 'Test Feed',
    feedUrl: 'https://example.com/feed.xml',
    siteUrl: 'https://example.com',
    description: 'A test feed for testing',
    category: '技术',
    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
    unreadCount: 5,
  };

  it('renders feed information correctly', () => {
    render(<FeedCard feed={mockFeed} />);

    expect(screen.getByText('Test Feed')).toBeInTheDocument();
    expect(screen.getByText('技术')).toBeInTheDocument();
    expect(screen.getByText('A test feed for testing')).toBeInTheDocument();
    expect(screen.getByText('5 篇未读')).toBeInTheDocument();
  });

  it('shows green dot when unread count > 0', () => {
    render(<FeedCard feed={mockFeed} />);
    const greenDot = document.querySelector('.bg-green-500');
    expect(greenDot).toBeInTheDocument();
  });

  it('shows "暂无新内容" when unread count is 0', () => {
    const feedWithNoUnread = { ...mockFeed, unreadCount: 0 };
    render(<FeedCard feed={feedWithNoUnread} />);

    expect(screen.getByText('暂无新内容')).toBeInTheDocument();
  });

  it('is clickable as a link', () => {
    render(<FeedCard feed={mockFeed} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/feeds/${mockFeed.id}`);
  });

  it('renders without category when not provided', () => {
    const feedWithoutCategory = { ...mockFeed, category: undefined };
    render(<FeedCard feed={feedWithoutCategory} />);

    // Should not have a category badge
    const categoryBadges = screen.queryAllByText(/技术|设计|新闻/);
    expect(categoryBadges.length).toBe(0);
  });

  it('renders without description when not provided', () => {
    const feedWithoutDescription = { ...mockFeed, description: undefined };
    render(<FeedCard feed={feedWithoutDescription} />);

    // Should not show description text
    expect(screen.queryByText('A test feed for testing')).not.toBeInTheDocument();
  });

  it('formats last update time correctly', () => {
    const now = Date.now();
    const feedWithRecentUpdate = { ...mockFeed, lastUpdatedAt: now };
    render(<FeedCard feed={feedWithRecentUpdate} />);

    expect(screen.getByText('今天')).toBeInTheDocument();
  });
});
