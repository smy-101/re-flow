// SWR Configuration
export { swrConfig, fetcher } from './config';

// Data fetching hooks
export { useFeeds, useFeed, revalidateFeeds } from './use-feeds';
export { useItems, useItem } from './use-items';
export { useCategories } from './use-categories';

// Mutation hooks
export {
  useCreateFeed,
  useUpdateFeed,
  useDeleteFeed,
  useRefreshFeed,
  useMarkAsRead,
  useToggleFavorite,
  useMarkAllAsRead,
} from './use-mutations';

// Re-export types for convenience
export type { Feed, CreateFeedInput, UpdateFeedInput } from '@/lib/api/feeds';
export type { FeedItem, FetchItemsOptions } from '@/lib/api/items';
