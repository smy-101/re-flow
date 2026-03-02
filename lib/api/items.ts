// Import types from schema
import type { FeedItem, NewFeedItem } from '@/lib/db/schema';

export type { NewFeedItem };

export type { FeedItem };

export interface FetchItemsOptions {
  feedId?: string;
  isRead?: boolean;
  isFavorite?: boolean;
}

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`, window.location.href);

  // Add query parameters if provided
  if (options.method === 'GET' && options.params) {
    const params: Record<string, string | boolean | undefined> = options.params;
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json() as Promise<T>;
}

// API: Fetch all items for current user
export async function fetchItems(options?: FetchItemsOptions): Promise<FeedItem[]> {
  const requestOptions: RequestOptions = {
    method: 'GET',
  };

  if (options) {
    // Only include defined values in params
    const params: Record<string, string | boolean | undefined> = {};
    if (options.feedId !== undefined) params.feedId = options.feedId;
    if (options.isRead !== undefined) params.isRead = options.isRead;
    if (options.isFavorite !== undefined) params.isFavorite = options.isFavorite;
    requestOptions.params = params;
  }

  return request<FeedItem[]>('/items', requestOptions);
}

// API: Fetch a single item by ID
export async function fetchItemById(itemId: string | number): Promise<FeedItem | null> {
  try {
    return await request<FeedItem>(`/items/${itemId}`);
  } catch {
    return null;
  }
}

// API: Mark item as read/unread
export async function markAsRead(
  itemId: string | number,
  isRead: boolean,
): Promise<FeedItem | null> {
  try {
    return await request<FeedItem>(`/items/${itemId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead }),
    });
  } catch {
    return null;
  }
}

// API: Toggle item favorite status
export async function toggleFavorite(itemId: string | number): Promise<FeedItem | null> {
  try {
    return await request<FeedItem>(`/items/${itemId}/favorite`, {
      method: 'POST',
    });
  } catch {
    return null;
  }
}
