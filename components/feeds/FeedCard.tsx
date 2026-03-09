'use client';

import Link from 'next/link';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import { Feed, refreshFeed } from '@/lib/api/feeds';

interface FeedCardProps {
  feed: Feed;
  onRefresh?: (feedId: number) => void;
  onOpenSettings?: (feed: Feed) => void;
}

export default function FeedCard({ feed, onRefresh, onOpenSettings }: FeedCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRefreshing(true);
    setError(null);

    try {
      const result = await refreshFeed(feed.id);

      if (result.success) {
        // Show toast notification (simple implementation)
        if (result.itemsAdded > 0) {
          showToast(`成功刷新！新增 ${result.itemsAdded} 篇文章`, 'success');
        } else {
          showToast('刷新成功，没有新内容', 'info');
        }

        // Call parent callback to refresh the feed list
        onRefresh?.(feed.id);
      } else {
        const errorMessage = result.error || '刷新失败';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch {
      const errorMessage = '网络错误，请稍后重试';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Simple toast implementation
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return (
    <Link href={`/feeds/${feed.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {feed.title}
              </h3>
              {feed.unreadCount > 0 && (
                <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>

            {feed.category && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full mb-2">
                {feed.category}
              </span>
            )}

            {feed.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {feed.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {feed.unreadCount > 0 ? `${feed.unreadCount} 篇未读` : '暂无新内容'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(feed.lastUpdatedAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Refresh button */}
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleRefresh}
              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                isRefreshing
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              aria-label={isRefreshing ? '刷新中...' : '刷新'}
              title={isRefreshing ? '刷新中...' : '刷新'}
            >
              {isRefreshing ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenSettings?.(feed);
              }}
              aria-label="设置"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
            {error}
          </div>
        )}
      </Card>
    </Link>
  );
}
