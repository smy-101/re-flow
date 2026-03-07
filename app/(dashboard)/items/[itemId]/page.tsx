'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { fetchItemById, fetchItems, markAsRead, FeedItem } from '@/lib/api/items';
import { fetchFeedById, Feed } from '@/lib/api/feeds';
import { getFeedItemProcessingHistory, type ProcessingResult } from '@/lib/api/processing-results';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import ReadToggleButton from '@/components/items/ReadToggleButton';
import FavoriteButton from '@/components/items/FavoriteButton';
import ItemNavigation from '@/components/items/ItemNavigation';
import {
  ProcessButton,
  ResultViewer,
  ProcessingHistory,
} from '@/components/processing';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;
  const itemIdNum = parseInt(itemId, 10);

  const [item, setItem] = useState<FeedItem | null>(null);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Processing state
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ProcessingResult | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadProcessingHistory = useCallback(async () => {
    try {
      const results = await getFeedItemProcessingHistory(itemIdNum);
      setProcessingResults(results);
      // Auto-select the latest successful result
      const latestDone = results.find((r) => r.status === 'done');
      if (latestDone && !selectedResult) {
        setSelectedResult(latestDone);
      }
    } catch (err) {
      console.error('Failed to load processing history:', err);
    }
  }, [itemIdNum, selectedResult]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [itemData, itemsData] = await Promise.all([
          fetchItemById(itemId),
          fetchItems(),
        ]);

        if (!itemData) {
          setError('文章不存在');
          return;
        }

        setItem(itemData);

        // Auto-mark as read
        if (!itemData.isRead) {
          await markAsRead(itemId, true);
          itemData.isRead = true;
        }

        // Load feed info
        const feedData = await fetchFeedById(itemData.feedId);
        setFeed(feedData);

        setAllItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载文章失败');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [itemId]);

  // Load processing history when item is loaded
  useEffect(() => {
    if (item) {
      loadProcessingHistory();
    }
  }, [item, loadProcessingHistory]);

  const currentItemIndex = allItems.findIndex((i) => i.id === itemIdNum);

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      router.push(`/items/${allItems[currentItemIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (currentItemIndex < allItems.length - 1) {
      router.push(`/items/${allItems[currentItemIndex + 1].id}`);
    }
  };

  const handleProcessingComplete = useCallback(
    (result: ProcessingResult) => {
      setRefreshTrigger((prev) => prev + 1);
      setSelectedResult(result);
    },
    [],
  );

  const handleSelectResult = useCallback((result: ProcessingResult) => {
    setSelectedResult(result);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !item || !feed) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error || '文章不存在'}</p>
          <Button onClick={() => router.back()}>返回</Button>
        </div>
      </Card>
    );
  }

  const hasExistingResults = processingResults.some((r) => r.status === 'done');

  return (
    <div>
      <Link
        href="/items"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回列表
      </Link>

      <article className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
              {feed.title}
            </span>
            {item.isRead && (
              <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full">
                已读
              </span>
            )}
            {item.isFavorite && (
              <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
                已收藏
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            {item.author && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {item.author}
              </span>
            )}

            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(item.publishedAt)}
            </span>

            {item.readingTime && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                阅读时长: {item.readingTime} 分钟
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <ReadToggleButton itemId={item.id} isRead={item.isRead} />
            <FavoriteButton itemId={item.id} isFavorite={item.isFavorite} />
            <ProcessButton
              feedItemId={item.id}
              onProcessingComplete={handleProcessingComplete}
              hasExistingResults={hasExistingResults}
            />
          </div>
        </header>

        {/* Content with Result Viewer */}
        <Card padding="lg">
          <ResultViewer
            originalContent={item.content}
            processingResult={selectedResult}
          />
        </Card>

        {/* Processing History */}
        {processingResults.length > 0 && (
          <Card padding="md" className="mt-4">
            <ProcessingHistory
              feedItemId={item.id}
              onSelectResult={handleSelectResult}
              selectedResultId={selectedResult?.id}
              refreshTrigger={refreshTrigger}
            />
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-8 flex justify-between items-center">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            在原文中查看
          </a>
        </footer>
      </article>

      <ItemNavigation
        currentItemIndex={currentItemIndex}
        totalItems={allItems.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}
