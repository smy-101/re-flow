import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { FavoriteProvider, useFavoriteCount } from '@/lib/context/FavoriteContext';
import { fetchFavoriteCount } from '@/lib/api/items';

// Mock dependencies
vi.mock('@/lib/api/items', () => ({
  fetchFavoriteCount: vi.fn(),
}));

describe('FavoriteContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function TestComponent() {
    const { count, increment, decrement } = useFavoriteCount();
    return (
      <div>
        <span data-testid="count">{count}</span>
        <button data-testid="increment" onClick={increment}>
          Increment
        </button>
        <button data-testid="decrement" onClick={decrement}>
          Decrement
        </button>
      </div>
    );
  }

  describe('initialization', () => {
    it('should fetch favorite count on mount', async () => {
      vi.mocked(fetchFavoriteCount).mockResolvedValueOnce({ count: 5 });

      render(
        <FavoriteProvider>
          <TestComponent />
        </FavoriteProvider>,
      );

      await waitFor(() => {
        expect(fetchFavoriteCount).toHaveBeenCalledTimes(1);
      });
    });

    it('should display fetched favorite count', async () => {
      vi.mocked(fetchFavoriteCount).mockResolvedValueOnce({ count: 10 });

      render(
        <FavoriteProvider>
          <TestComponent />
        </FavoriteProvider>,
      );

      await waitFor(() => {
        const count = screen.getByTestId('count');
        expect(count.textContent).toBe('10');
      });
    });
  });

  describe('increment', () => {
    it('should increment count when increment is called', async () => {
      vi.mocked(fetchFavoriteCount).mockResolvedValueOnce({ count: 5 });

      render(
        <FavoriteProvider>
          <TestComponent />
        </FavoriteProvider>,
      );

      await waitFor(() => {
        const count = screen.getByTestId('count');
        expect(count.textContent).toBe('5');
      });

      const incrementButton = screen.getByTestId('increment');
      act(() => {
        incrementButton.click();
      });

      expect(screen.getByTestId('count').textContent).toBe('6');
    });

    it('should increment multiple times', async () => {
      vi.mocked(fetchFavoriteCount).mockResolvedValueOnce({ count: 0 });

      render(
        <FavoriteProvider>
          <TestComponent />
        </FavoriteProvider>,
      );

      await waitFor(() => {
        const count = screen.getByTestId('count');
        expect(count.textContent).toBe('0');
      });

      const incrementButton = screen.getByTestId('increment');
      act(() => {
        incrementButton.click();
        incrementButton.click();
        incrementButton.click();
      });

      expect(screen.getByTestId('count').textContent).toBe('3');
    });
  });

  describe('decrement', () => {
    it('should decrement count when decrement is called', async () => {
      vi.mocked(fetchFavoriteCount).mockResolvedValueOnce({ count: 10 });

      render(
        <FavoriteProvider>
          <TestComponent />
        </FavoriteProvider>,
      );

      await waitFor(() => {
        const count = screen.getByTestId('count');
        expect(count.textContent).toBe('10');
      });

      const decrementButton = screen.getByTestId('decrement');
      act(() => {
        decrementButton.click();
      });

      expect(screen.getByTestId('count').textContent).toBe('9');
    });

    it('should not go below zero when decrementing', async () => {
      vi.mocked(fetchFavoriteCount).mockResolvedValueOnce({ count: 1 });

      render(
        <FavoriteProvider>
          <TestComponent />
        </FavoriteProvider>,
      );

      await waitFor(() => {
        const count = screen.getByTestId('count');
        expect(count.textContent).toBe('1');
      });

      const decrementButton = screen.getByTestId('decrement');
      act(() => {
        decrementButton.click();
      });
      expect(screen.getByTestId('count').textContent).toBe('0');

      act(() => {
        decrementButton.click();
        decrementButton.click();
      });

      // Should still be 0, not negative
      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });

  describe('error handling', () => {
    it('should handle API error gracefully', async () => {
      vi.mocked(fetchFavoriteCount).mockRejectedValueOnce(new Error('API Error'));

      render(
        <FavoriteProvider>
          <TestComponent />
        </FavoriteProvider>,
      );

      // Should not crash, just keep default value
      await waitFor(() => {
        const count = screen.getByTestId('count');
        expect(count.textContent).toBe('0');
      });
    });
  });
});
