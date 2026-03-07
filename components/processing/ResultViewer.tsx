'use client';

import { useState, useCallback } from 'react';
import type { ProcessingResult } from '@/lib/api/processing-results';

type ViewMode = 'result' | 'original';

interface ResultViewerProps {
  originalContent: string;
  processingResult: ProcessingResult | null;
  className?: string;
}

export default function ResultViewer({
  originalContent,
  processingResult,
  className = '',
}: ResultViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    processingResult?.status === 'done' ? 'result' : 'original',
  );

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const hasResult = processingResult?.status === 'done';
  const hasError = processingResult?.status === 'error';

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'result'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          } ${!hasResult ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => hasResult && handleViewModeChange('result')}
          disabled={!hasResult}
        >
          处理结果
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            viewMode === 'original'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleViewModeChange('original')}
        >
          原文
        </button>
      </div>

      {/* Content Area */}
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {viewMode === 'result' && hasResult && (
          <div className="space-y-4">
            {/* Result Content */}
            <div
              className="text-gray-700 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: processingResult.output ?? '',
              }}
            />

            {/* Meta Information */}
            <div className="border-t border-gray-200 pt-4 mt-4 text-xs text-gray-500 space-y-1">
              <div>
                处理时间: {formatDate(processingResult.createdAt)}
              </div>
              {processingResult.completedAt && (
                <div>
                  完成时间: {formatDate(processingResult.completedAt)}
                </div>
              )}
              {processingResult.templateName && (
                <div>使用模板: {processingResult.templateName}</div>
              )}
              {processingResult.pipelineName && (
                <div>使用管道: {processingResult.pipelineName}</div>
              )}
              {processingResult.tokensUsed !== null &&
                processingResult.tokensUsed > 0 && (
                  <div>Token 消耗: {processingResult.tokensUsed.toLocaleString()}</div>
                )}
            </div>
          </div>
        )}

        {viewMode === 'result' && hasError && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">处理失败</div>
            {processingResult.errorMessage && (
              <div className="text-sm text-red-500">
                {processingResult.errorMessage}
              </div>
            )}
          </div>
        )}

        {viewMode === 'result' && !hasResult && !hasError && (
          <div className="text-center py-8 text-gray-500">
            暂无处理结果
          </div>
        )}

        {viewMode === 'original' && (
          <div
            className="text-gray-700"
            dangerouslySetInnerHTML={{ __html: originalContent }}
          />
        )}
      </div>
    </div>
  );
}
