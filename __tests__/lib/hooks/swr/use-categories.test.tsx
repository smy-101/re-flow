import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { useCategories } from '@/lib/hooks/swr/use-categories';

// Mock the API functions
vi.mock('@/lib/api/categories', () => ({
  getCategories: vi.fn(),
}));

const mockCategories = ['Technology', 'News', 'Blogs'];

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return categories on successful fetch', async () => {
    const { getCategories } = await import('@/lib/api/categories');
    vi.mocked(getCategories).mockResolvedValue(mockCategories);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCategories(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.categories).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.isError).toBe(false);
  });

  it('should handle fetch errors', async () => {
    const { getCategories } = await import('@/lib/api/categories');
    vi.mocked(getCategories).mockRejectedValue(new Error('Failed to fetch'));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('should return mutate function for revalidation', async () => {
    const { getCategories } = await import('@/lib/api/categories');
    vi.mocked(getCategories).mockResolvedValue(mockCategories);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.mutate).toBe('function');
  });
});
