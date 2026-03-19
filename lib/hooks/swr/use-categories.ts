import useSWR from 'swr';
import { getCategories } from '@/lib/api/categories';

const API_BASE = '/api/categories';

/**
 * Hook to fetch available categories
 */
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<string[]>(
    API_BASE,
    () => getCategories()
  );

  return {
    categories: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
