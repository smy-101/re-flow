import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createFeed } from '@/lib/api/feeds';
import { validateFeedUrl } from '@/lib/api/validate';
import AddFeedForm from '@/components/feeds/AddFeedForm';

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the API
vi.mock('@/lib/api/feeds', () => ({
  createFeed: vi.fn(),
}));

vi.mock('@/lib/api/validate', () => ({
  validateFeedUrl: vi.fn(),
}));

vi.mock('@/lib/api/categories', () => ({
  getCategories: vi.fn(() => ['技术', '设计', '新闻']),
}));

describe('AddFeedForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<AddFeedForm />);

    expect(screen.getByLabelText('RSS Feed URL *')).toBeInTheDocument();
    expect(screen.getByLabelText('自定义名称（可选）')).toBeInTheDocument();
    expect(screen.getByText('分类（可选）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '验证 URL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加订阅' })).toBeInTheDocument();
  });

  it('shows error when URL is empty on submit', async () => {
    const user = userEvent.setup();
    render(<AddFeedForm />);

    const submitButton = screen.getByRole('button', { name: '添加订阅' });
    await user.click(submitButton);

    expect(screen.getByText('请输入 RSS Feed URL')).toBeInTheDocument();
  });

  it('calls validateFeedUrl when validate button is clicked', async () => {
    const user = userEvent.setup();
    (validateFeedUrl as jest.Mock).mockResolvedValue({
      valid: true,
      title: 'Test Feed',
    });

    render(<AddFeedForm />);

    const urlInput = screen.getByLabelText('RSS Feed URL *');
    await user.type(urlInput, 'https://example.com/feed.xml');

    const validateButton = screen.getByRole('button', { name: '验证 URL' });
    await user.click(validateButton);

    await waitFor(() => {
      expect(validateFeedUrl).toHaveBeenCalledWith('https://example.com/feed.xml');
    });
  });

  it('shows success message when validation passes', async () => {
    const user = userEvent.setup();
    (validateFeedUrl as jest.Mock).mockResolvedValue({
      valid: true,
      title: 'Test Feed',
    });

    render(<AddFeedForm />);

    const urlInput = screen.getByLabelText('RSS Feed URL *');
    await user.type(urlInput, 'https://example.com/feed.xml');

    const validateButton = screen.getByRole('button', { name: '验证 URL' });
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText(/✓ Feed 有效/)).toBeInTheDocument();
    });
  });

  it('shows error message when validation fails', async () => {
    const user = userEvent.setup();
    (validateFeedUrl as jest.Mock).mockResolvedValue({
      valid: false,
      error: '无法解析此 RSS feed',
    });

    render(<AddFeedForm />);

    const urlInput = screen.getByLabelText('RSS Feed URL *');
    await user.type(urlInput, 'https://invalid.com/feed.xml');

    const validateButton = screen.getByRole('button', { name: '验证 URL' });
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText(/✗ 无法解析此 RSS feed/)).toBeInTheDocument();
    });
  });

  it('auto-fills title from validation result', async () => {
    const user = userEvent.setup();
    (validateFeedUrl as jest.Mock).mockResolvedValue({
      valid: true,
      title: 'Auto-detected Title',
    });

    render(<AddFeedForm />);

    const urlInput = screen.getByLabelText('RSS Feed URL *');
    await user.type(urlInput, 'https://example.com/feed.xml');

    const validateButton = screen.getByRole('button', { name: '验证 URL' });
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Auto-detected Title')).toBeInTheDocument();
    });
  });

  it('calls createFeed with correct data on submit', async () => {
    const user = userEvent.setup();
    (validateFeedUrl as jest.Mock).mockResolvedValue({
      valid: true,
      title: 'Test Feed',
    });
    (createFeed as jest.Mock).mockResolvedValue({ id: 'feed-1' });

    render(<AddFeedForm />);

    const urlInput = screen.getByLabelText('RSS Feed URL *');
    await user.type(urlInput, 'https://example.com/feed.xml');

    const validateButton = screen.getByRole('button', { name: '验证 URL' });
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText(/✓ Feed 有效/)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: '添加订阅' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(createFeed).toHaveBeenCalledWith({
        feedUrl: 'https://example.com/feed.xml',
        title: 'Test Feed',
        category: undefined,
      });
    });
  });

  it('disables submit button until validation passes', async () => {
    render(<AddFeedForm />);

    const submitButton = screen.getByRole('button', { name: '添加订阅' });
    expect(submitButton).toBeDisabled();
  });
});
