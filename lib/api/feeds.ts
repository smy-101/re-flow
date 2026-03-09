// Import base types from schema
import type { Feed as FeedSchema, NewFeed } from '@/lib/db/schema';

export type { NewFeed };

// Extended Feed type with unreadCount (calculated field)
// The API returns feeds with unreadCount added
export interface Feed extends FeedSchema {
  unreadCount: number;
}

export interface CreateFeedInput {
  feedUrl: string;
  title?: string;
  category?: string;
  pipelineId?: number | null;
  templateId?: number | null;
  autoProcess?: boolean;
}

export interface UpdateFeedInput {
  title?: string;
  category?: string;
  pipelineId?: number | null;
  templateId?: number | null;
  autoProcess?: boolean;
}

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
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

  // For DELETE with no content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// API: Fetch all feeds for current user
export async function fetchFeeds(): Promise<Feed[]> {
  return request<Feed[]>('/feeds');
}

// API: Fetch a single feed by ID
export async function fetchFeedById(feedId: string | number): Promise<Feed | null> {
  try {
    return await request<Feed>(`/feeds/${feedId}`);
  } catch {
    return null;
  }
}

// API: Create a new feed
export async function createFeed(input: CreateFeedInput): Promise<Feed> {
  return request<Feed>('/feeds', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// API: Update a feed
export async function updateFeed(
  feedId: string | number,
  input: UpdateFeedInput,
): Promise<Feed | null> {
  try {
    return await request<Feed>(`/feeds/${feedId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  } catch {
    return null;
  }
}

// API: Delete a feed
export async function deleteFeed(feedId: string | number): Promise<boolean> {
  try {
    await request(`/feeds/${feedId}`, {
      method: 'DELETE',
    });
    return true;
  } catch {
    return false;
  }
}

// API: Refresh a single feed
export async function refreshFeed(
  feedId: string | number
): Promise<{ success: boolean; itemsAdded: number; error?: string }> {
  return await request<{ success: boolean; itemsAdded: number; error?: string }>(
    `/feeds/${feedId}/refresh`,
    {
      method: 'POST',
    }
  );
}

// API: Refresh all feeds (internal use, requires CRON_SECRET)
export async function refreshAllFeeds(
  cronSecret: string
): Promise<{
  processed: number;
  totalItemsAdded: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    feedId: number;
    success: boolean;
    itemsAdded: number;
    error?: string;
  }>;
}> {
  const response = await fetch(`${API_BASE}/feeds/refresh-all`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': cronSecret,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json() as Promise<{
    processed: number;
    totalItemsAdded: number;
    successCount: number;
    failureCount: number;
    results: Array<{
      feedId: number;
      success: boolean;
      itemsAdded: number;
      error?: string;
    }>;
  }>;
}
