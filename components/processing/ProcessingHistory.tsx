'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProcessingResult } from '@/lib/api/processing-results';
import { getFeedItemProcessingHistory } from '@/lib/api/processing-results';
import ProcessProgress from './ProcessProgress';

interface ProcessingHistoryProps {
  feedItemId: number;
  onSelectResult: (result: ProcessingResult) => void;
  selectedResultId?: number | null;
  refreshTrigger?: number;
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
  }, [fetchHistory, refreshTrigger]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (results.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        暂无处理历史
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-2">处理历史</h4>
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
    </div>
  );
}
