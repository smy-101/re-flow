import useSWRMutation from 'swr/mutation';
import { mutate as globalMutate } from 'swr';
import {
  createFeed,
  updateFeed,
  deleteFeed,
  refreshFeed,
  type Feed,
  type CreateFeedInput,
  type UpdateFeedInput,
} from '@/lib/api/feeds';
import {
  markAsRead,
  toggleFavorite,
  markAllAsRead,
  type FeedItem,
} from '@/lib/api/items';
import { revalidateFeeds } from './use-feeds';

const FEEDS_KEY = '/api/feeds';

// Feed Mutations

/**
 * Hook to create a new feed
 */
export function useCreateFeed() {
  return useSWRMutation<Feed, Error, string, CreateFeedInput>(
    FEEDS_KEY,
    async (_key, { arg }: { arg: CreateFeedInput }) => {
      const feed = await createFeed(arg);
      // Revalidate feeds list after creation
      await revalidateFeeds();
      return feed;
    }
  );
}

/**
 * Hook to update a feed (feedId can be passed dynamically)
 */
export function useUpdateFeed(feedId?: string | number) {
  return useSWRMutation<Feed | null, Error, string, { feedId: string | number; data: UpdateFeedInput }>(
    feedId != null ? `${FEEDS_KEY}/${feedId}` : FEEDS_KEY,
    async (_key, { arg }: { arg: { feedId: string | number; data: UpdateFeedInput } }) => {
      const feed = await updateFeed(arg.feedId, arg.data);
      // Revalidate feeds list after update
      await revalidateFeeds();
      return feed;
    }
  );
}

/**
 * Hook to delete a feed
 */
export function useDeleteFeed() {
  return useSWRMutation<boolean, Error, string, string | number>(
    FEEDS_KEY,
    async (_key, { arg }: { arg: string | number }) => {
      const success = await deleteFeed(arg);
      if (success) {
        // Revalidate feeds list after deletion
        await revalidateFeeds();
      }
      return success;
    }
  );
}

/**
 * Hook to refresh a feed
 */
export function useRefreshFeed(feedId: string | number) {
  return useSWRMutation<{ success: boolean; itemsAdded: number; error?: string }, Error, string>(
    `${FEEDS_KEY}/${feedId}/refresh`,
    async () => {
      const result = await refreshFeed(feedId);
      // Revalidate feeds list to update unread count
      await revalidateFeeds();
      return result;
    }
  );
}

// Item Mutations

const ITEMS_KEY = '/api/items';

/**
 * Hook to mark an item as read/unread
 */
export function useMarkAsRead(itemId: string | number) {
  return useSWRMutation<FeedItem | null, Error, string, boolean>(
    `${ITEMS_KEY}/${itemId}/read`,
    async (_key, { arg }: { arg: boolean }) => {
      const item = await markAsRead(itemId, arg);
      // Revalidate items and feeds to update counts
      await globalMutate(ITEMS_KEY);
      await revalidateFeeds();
      return item;
    }
  );
}

/**
 * Hook to toggle item favorite status
 */
export function useToggleFavorite(itemId: string | number) {
  return useSWRMutation<FeedItem | null, Error, string>(
    `${ITEMS_KEY}/${itemId}/favorite`,
    async () => {
      const item = await toggleFavorite(itemId);
      // Revalidate items and favorites count
      await globalMutate(ITEMS_KEY);
      await globalMutate('/api/favorites/count');
      return item;
    }
  );
}

/**
 * Hook to mark all items as read
 */
export function useMarkAllAsRead() {
  return useSWRMutation<{ success: boolean; count: number }, Error, string, number | undefined>(
    ITEMS_KEY,
    async (_key, { arg }: { arg: number | undefined }) => {
      const result = await markAllAsRead(arg);
      if (result.success) {
        // Revalidate all items and feeds
        await globalMutate(ITEMS_KEY);
        await revalidateFeeds();
      }
      return result;
    }
  );
}
