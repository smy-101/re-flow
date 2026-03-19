import useSWR, { mutate } from 'swr';
import { fetchFeeds, fetchFeedById, type Feed } from '@/lib/api/feeds';

const API_BASE = '/api/feeds';

/**
 * Hook to fetch all feeds for the current user
 */
export function useFeeds() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Feed[]>(
    API_BASE,
    () => fetchFeeds()
  );

  return {
    feeds: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate: revalidate,
  };
}

/**
 * Hook to fetch a single feed by ID
 * @param feedId - The feed ID, or null/undefined to skip fetching
 */
export function useFeed(feedId: string | number | null | undefined) {
  const { data, error, isLoading, mutate: revalidate } = useSWR<Feed | null>(
    feedId != null ? `${API_BASE}/${feedId}` : null,
    () => feedId != null ? fetchFeedById(feedId) : null
  );

  return {
    feed: data,
    isLoading,
    isError: !!error,
    error,
    mutate: revalidate,
  };
}

/**
 * Revalidate all feeds cache
 */
export function revalidateFeeds() {
  return mutate(API_BASE);
}
