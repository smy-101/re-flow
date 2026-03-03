import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReadToggleButton from '@/components/items/ReadToggleButton';
import { markAsRead } from '@/lib/api/items';

// Mock API
vi.mock('@/lib/api/items');

describe('ReadToggleButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "未读" when item is not read', () => {
    render(<ReadToggleButton itemId="item-1" isRead={false} />);

    expect(screen.getByRole('button', { name: /未读/ })).toBeInTheDocument();
  });

  it('renders "已读" when item is read', () => {
    render(<ReadToggleButton itemId="item-1" isRead={true} />);

    expect(screen.getByRole('button', { name: /已读/ })).toBeInTheDocument();
  });

  it('calls stopPropagation when clicked', async () => {
    (markAsRead as jest.Mock).mockResolvedValue(undefined);

    render(<ReadToggleButton itemId="item-1" isRead={false} />);

    const button = screen.getByRole('button', { name: /未读/ });
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

  it('calls markAsRead API when toggling to read', async () => {
    (markAsRead as jest.Mock).mockResolvedValue(undefined);

    render(<ReadToggleButton itemId="item-1" isRead={false} />);

    const button = screen.getByRole('button', { name: /未读/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('item-1', true);
    });
  });

  it('calls markAsRead API when toggling to unread', async () => {
    (markAsRead as jest.Mock).mockResolvedValue(undefined);

    render(<ReadToggleButton itemId="item-1" isRead={true} />);

    const button = screen.getByRole('button', { name: /已读/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('item-1', false);
    });
  });

  it('updates component state to "已读" when toggled', async () => {
    (markAsRead as jest.Mock).mockResolvedValue(undefined);

    render(<ReadToggleButton itemId="item-1" isRead={false} />);

    const button = screen.getByRole('button', { name: /未读/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /已读/ })).toBeInTheDocument();
    });
  });

  it('updates component state to "未读" when toggled', async () => {
    (markAsRead as jest.Mock).mockResolvedValue(undefined);

    render(<ReadToggleButton itemId="item-1" isRead={true} />);

    const button = screen.getByRole('button', { name: /已读/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /未读/ })).toBeInTheDocument();
    });
  });

  it('calls onUpdate callback when provided', async () => {
    const mockOnUpdate = vi.fn();
    (markAsRead as jest.Mock).mockResolvedValue(undefined);

    render(
      <ReadToggleButton itemId="item-1" isRead={false} onUpdate={mockOnUpdate} />
    );

    const button = screen.getByRole('button', { name: /未读/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(true);
    });
  });

  it('shows loading state while toggling', async () => {
    let resolvePromise: (value: void) => void;
    (markAsRead as jest.Mock).mockImplementation(
      () => new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<ReadToggleButton itemId="item-1" isRead={false} />);

    const button = screen.getByRole('button', { name: /未读/ });
    fireEvent.click(button);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Resolve promise
    resolvePromise!();
  });

  it('handles API errors gracefully', async () => {
    (markAsRead as jest.Mock).mockRejectedValue(new Error('API Error'));
    console.error = vi.fn();

    render(<ReadToggleButton itemId="item-1" isRead={false} />);

    const button = screen.getByRole('button', { name: /未读/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Failed to toggle read status:',
        expect.any(Error)
      );
    });

    // Button should not be disabled after error
    expect(button).not.toBeDisabled();
  });
});
