import useSWR from 'swr';
import { fetchItems, fetchItemById, type FeedItem, type FetchItemsOptions } from '@/lib/api/items';

const API_BASE = '/api/items';

/**
 * Build SWR key from items options
 */
function buildItemsKey(options?: FetchItemsOptions): string {
  if (!options) return API_BASE;

  const params = new URLSearchParams();
  if (options.feedId !== undefined) params.set('feedId', String(options.feedId));
  if (options.isRead !== undefined) params.set('isRead', String(options.isRead));
  if (options.isFavorite !== undefined) params.set('isFavorite', String(options.isFavorite));

  const queryString = params.toString();
  return queryString ? `${API_BASE}?${queryString}` : API_BASE;
}

/**
 * Hook to fetch items with optional filters
 */
export function useItems(options?: FetchItemsOptions) {
  const key = buildItemsKey(options);

  const { data, error, isLoading, mutate } = useSWR<FeedItem[]>(
    key,
    () => fetchItems(options)
  );

  return {
    items: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single item by ID
 * @param itemId - The item ID, or null/undefined to skip fetching
 */
export function useItem(itemId: string | number | null | undefined) {
  const { data, error, isLoading, mutate } = useSWR<FeedItem | null>(
    itemId != null ? `${API_BASE}/${itemId}` : null,
    () => itemId != null ? fetchItemById(itemId) : null
  );

  return {
    item: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
