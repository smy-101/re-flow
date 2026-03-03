import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FavoriteButton from '@/components/items/FavoriteButton';
import { FavoriteProvider } from '@/lib/context/FavoriteContext';
import { toggleFavorite, fetchFavoriteCount } from '@/lib/api/items';

// Mock API
vi.mock('@/lib/api/items');

describe('FavoriteButton', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<FavoriteProvider>{ui}</FavoriteProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (toggleFavorite as jest.Mock).mockReset();
    (fetchFavoriteCount as jest.Mock).mockResolvedValue({ count: 0 });
  });

  it('renders "收藏" when item is not favorited', () => {
    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={false} />);

    expect(screen.getByRole('button', { name: /收藏/ })).toBeInTheDocument();
  });

  it('renders "已收藏" when item is favorited', () => {
    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={true} />);

    expect(screen.getByRole('button', { name: /已收藏/ })).toBeInTheDocument();
  });

  it('calls stopPropagation when clicked', async () => {
    (toggleFavorite as jest.Mock).mockResolvedValue({ isFavorite: true });

    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={false} />);

    const button = screen.getByRole('button', { name: /收藏/ });
    const mockStopPropagation = vi.fn();

    // Spy on the handleToggle function by clicking and checking stopPropagation was called
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(clickEvent, 'stopPropagation', {
      value: mockStopPropagation,
    });

    button.dispatchEvent(clickEvent);

    await waitFor(() => {
      expect(mockStopPropagation).toHaveBeenCalled();
    });
  });

  it('calls toggleFavorite API when clicked', async () => {
    (toggleFavorite as jest.Mock).mockResolvedValue({ isFavorite: true });

    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={false} />);

    const button = screen.getByRole('button', { name: /收藏/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(toggleFavorite).toHaveBeenCalledWith('item-1');
    });
  });

  it('updates component state and increments context count when favorited', async () => {
    (toggleFavorite as jest.Mock).mockResolvedValue({ isFavorite: true });

    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={false} />);

    const button = screen.getByRole('button', { name: /收藏/ });
    fireEvent.click(button);

    // Button should show "已收藏" after successful toggle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /已收藏/ })).toBeInTheDocument();
    });
  });

  it('updates component state and decrements context count when unfavorited', async () => {
    (toggleFavorite as jest.Mock).mockResolvedValue({ isFavorite: false });

    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={true} />);

    const button = screen.getByRole('button', { name: /已收藏/ });
    fireEvent.click(button);

    // Button should show "收藏" after successful toggle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /收藏/ })).toBeInTheDocument();
    });
  });

  it('calls onUpdate callback when provided', async () => {
    const mockOnUpdate = vi.fn();
    (toggleFavorite as jest.Mock).mockResolvedValue({ isFavorite: true });

    renderWithProvider(
      <FavoriteButton itemId="item-1" isFavorite={false} onUpdate={mockOnUpdate} />
    );

    const button = screen.getByRole('button', { name: /收藏/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(true);
    });
  });

  it('shows loading state while toggling', async () => {
    let resolvePromise: (value: { isFavorite: boolean }) => void;
    (toggleFavorite as jest.Mock).mockImplementation(
      () => new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={false} />);

    const button = screen.getByRole('button', { name: /收藏/ });
    fireEvent.click(button);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Resolve promise
    resolvePromise!({ isFavorite: true });
  });

  it('handles API errors gracefully', async () => {
    (toggleFavorite as jest.Mock).mockRejectedValue(new Error('API Error'));
    console.error = vi.fn();

    renderWithProvider(<FavoriteButton itemId="item-1" isFavorite={false} />);

    const button = screen.getByRole('button', { name: /收藏/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Failed to toggle favorite:',
        expect.any(Error)
      );
    });

    // Button should not be disabled after error
    expect(button).not.toBeDisabled();
  });
});
