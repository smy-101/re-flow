'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getQueueStatus, getOverallQueueStatus, type QueueItemStatus, type OverallQueueStatus } from '@/lib/api/queue';

interface UseQueueStatusOptions {
  feedItemId?: number;
  pollingInterval?: number;
  enabled?: boolean;
}

interface UseQueueStatusReturn {
  status: QueueItemStatus | null;
  overallStatus: OverallQueueStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for polling queue status
 *
 * @param options.feedItemId - If provided, polls status for specific feed item
 * @param options.pollingInterval - Polling interval in milliseconds (default: 5000)
 * @param options.enabled - Whether polling is enabled (default: true)
 */
export function useQueueStatus(options: UseQueueStatusOptions = {}): UseQueueStatusReturn {
  const { feedItemId, pollingInterval = 5000, enabled = true } = options;

  const [status, setStatus] = useState<QueueItemStatus | null>(null);
  const [overallStatus, setOverallStatus] = useState<OverallQueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setError(null);

      if (feedItemId) {
        const result = await getQueueStatus(feedItemId);
        if (mountedRef.current) {
          setStatus(result);
        }
      } else {
        const result = await getOverallQueueStatus();
        if (mountedRef.current) {
          setOverallStatus(result);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch queue status'));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [feedItemId]);

  // Initial fetch and polling setup
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchStatus();

    // Set up polling
    pollingRef.current = setInterval(fetchStatus, pollingInterval);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [enabled, pollingInterval, fetchStatus]);

  // Stop polling when status is done or error
  useEffect(() => {
    if (status && (status.status === 'done' || status.status === 'error')) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.status]);

  return {
    status,
    overallStatus,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
