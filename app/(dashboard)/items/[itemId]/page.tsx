'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Clock, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import { fetchItemById, fetchItems, markAsRead, FeedItem } from '@/lib/api/items';
import { fetchFeedById, Feed } from '@/lib/api/feeds';
import { getFeedItemProcessingHistory, type ProcessingResult } from '@/lib/api/processing-results';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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

  const handleQueueSuccess = useCallback(() => {
    // Trigger refresh of processing history
    // The queue status will be updated by polling in ProcessingHistory
    setRefreshTrigger((prev) => prev + 1);
  }, []);

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
        <div className="py-8 text-center">
          <p className="mb-4 text-destructive">{error || '文章不存在'}</p>
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
        className="mb-6 inline-flex items-center text-primary transition-colors hover:text-primary/80"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回列表
      </Link>

      <article className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{feed.title}</Badge>
            {item.isRead ? <Badge variant="default">已读</Badge> : null}
            {item.isFavorite ? <Badge variant="warning">已收藏</Badge> : null}
          </div>

          <h1 className="mb-4 text-3xl font-bold text-foreground">{item.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {item.author ? (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {item.author}
              </span>
            ) : null}

            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(item.publishedAt)}
            </span>

            {item.readingTime ? (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                阅读时长: {item.readingTime} 分钟
              </span>
            ) : null}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-3">
            <ReadToggleButton itemId={item.id} isRead={item.isRead} />
            <FavoriteButton itemId={item.id} isFavorite={item.isFavorite} />
            <ProcessButton
              feedItemId={item.id}
              onQueueSuccess={handleQueueSuccess}
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
        {processingResults.length > 0 ? (
          <Card padding="md" className="mt-4">
            <ProcessingHistory
              feedItemId={item.id}
              onSelectResult={handleSelectResult}
              selectedResultId={selectedResult?.id}
              refreshTrigger={refreshTrigger}
            />
          </Card>
        ) : null}

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
          >
            <ExternalLink className="h-4 w-4" />
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
