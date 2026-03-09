'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProcessingResult } from '@/lib/api/processing-results';
import { getFeedItemProcessingHistory } from '@/lib/api/processing-results';
import { useQueueStatus } from '@/hooks/useQueueStatus';
import { retryQueueJob } from '@/lib/api/queue';
import ProcessProgress from './ProcessProgress';
import Button from '@/components/ui/Button';

interface ProcessingHistoryProps {
  feedItemId: number;
  onSelectResult: (result: ProcessingResult) => void;
  selectedResultId?: number | null;
  refreshTrigger?: number;
}

// Queue status badge component
function QueueStatusBadge({
  status,
  position,
  attempts,
  maxAttempts,
}: {
  status: string;
  position: number;
  attempts: number;
  maxAttempts: number;
}) {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return `排队中 #${position}`;
      case 'processing':
        return '处理中...';
      case 'done':
        return '已完成';
      case 'error':
        return `失败 (${attempts}/${maxAttempts})`;
      default:
        return status;
    }
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
}

export default function ProcessingHistory({
  feedItemId,
  onSelectResult,
  selectedResultId,
  refreshTrigger = 0,
}: ProcessingHistoryProps) {
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryingJobId, setRetryingJobId] = useState<number | null>(null);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  // Get queue status for this feed item
  const { status: queueStatus, refetch: refetchQueueStatus } = useQueueStatus({
    feedItemId,
    pollingInterval: 5000,
    enabled: true,
  });

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFeedItemProcessingHistory(feedItemId);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取处理历史失败');
    } finally {
      setIsLoading(false);
    }
  }, [feedItemId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger, localRefreshTrigger]);

  // Refresh history when queue status changes to done
  useEffect(() => {
    if (queueStatus?.status === 'done') {
      fetchHistory();
    }
  }, [queueStatus?.status, fetchHistory]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRetry = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    setRetryingJobId(jobId);
    try {
      await retryQueueJob(jobId);
      // Refresh queue status and history
      await refetchQueueStatus();
      setLocalRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重试失败');
    } finally {
      setRetryingJobId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">处理历史</h4>

      {/* Queue Status Section */}
      {queueStatus && queueStatus.status !== 'done' && (
        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
              <QueueStatusBadge
                status={queueStatus.status}
                position={queueStatus.position}
                attempts={queueStatus.attempts}
                maxAttempts={queueStatus.maxAttempts}
              />
            </div>
            {queueStatus.status === 'pending' && (
              <span className="text-xs text-gray-500">
                队列位置: #{queueStatus.position}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Queue Status with Retry */}
      {queueStatus && queueStatus.status === 'error' && (
        <div className="p-3 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <QueueStatusBadge
              status={queueStatus.status}
              position={queueStatus.position}
              attempts={queueStatus.attempts}
              maxAttempts={queueStatus.maxAttempts}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => handleRetry(e, queueStatus.id)}
              loading={retryingJobId === queueStatus.id}
              disabled={retryingJobId !== null}
            >
              重试
            </Button>
          </div>
          {queueStatus.errorMessage && (
            <p className="text-xs text-red-600 mt-1">
              {queueStatus.errorMessage}
            </p>
          )}
        </div>
      )}

      {/* Processing Results History */}
      {results.length === 0 && !queueStatus && (
        <div className="text-center py-4 text-gray-500 text-sm">
          暂无处理历史
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-2">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => onSelectResult(result)}
              className={`w-full text-left p-3 border rounded-lg transition-colors ${
                selectedResultId === result.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-900">
                  {result.templateName ?? result.pipelineName ?? '未知处理'}
                </div>
                <ProcessProgress status={result.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(result.createdAt)}</span>
                {result.tokensUsed !== null && result.tokensUsed > 0 && (
                  <span>{result.tokensUsed.toLocaleString()} tokens</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
