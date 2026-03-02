'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ItemCard from './ItemCard';
import MarkAllReadConfirm from './MarkAllReadConfirm';
import { fetchItems, markAllAsRead, FeedItem } from '@/lib/api/items';
import { fetchFeeds, Feed } from '@/lib/api/feeds';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type FilterStatus = 'all' | 'unread' | 'read';

interface ItemListProps {
  filterStatus?: FilterStatus;
  filterFavorite?: boolean;
  feedId?: string;
  showMarkAllRead?: boolean;
}

export default function ItemList({
  filterStatus = 'all',
  filterFavorite = false,
  feedId,
  showMarkAllRead = false,
}: ItemListProps) {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedFeed, setSelectedFeed] = useState<string | null>(feedId || null);

  // Mark all as read state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Convert filterStatus to isRead parameter
        let isRead: boolean | undefined;
        if (filterStatus === 'unread') {
          isRead = false;
        } else if (filterStatus === 'read') {
          isRead = true;
        }

        const [itemsData, feedsData] = await Promise.all([
          fetchItems({
            feedId: selectedFeed || undefined,
            isRead,
            isFavorite: filterFavorite ? true : undefined,
          }),
          fetchFeeds(),
        ]);

        setItems(itemsData);
        setFeeds(feedsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载文章失败');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [filterStatus, filterFavorite, selectedFeed]);

  const handleMarkAllRead = async () => {
    try {
      setIsMarking(true);
      const feedIdNum = feedId ? parseInt(feedId, 10) : undefined;
      await markAllAsRead(feedIdNum);

      // Reload data to refresh the list
      let isRead: boolean | undefined;
      if (filterStatus === 'unread') {
        isRead = false;
      } else if (filterStatus === 'read') {
        isRead = true;
      }

      const itemsData = await fetchItems({
        feedId: selectedFeed || undefined,
        isRead,
        isFavorite: filterFavorite ? true : undefined,
      });

      setItems(itemsData);
      setIsConfirmOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '标记失败');
    } finally {
      setIsMarking(false);
    }
  };

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.publishedAt - a.publishedAt;
    } else {
      return a.publishedAt - b.publishedAt;
    }
  });

  const getFeedTitle = (feedId: number) => {
    const feed = feeds.find((f) => f.id === feedId);
    return feed?.title;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:underline"
          >
            重新加载
          </button>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterStatus === 'unread' ? '暂无未读文章' :
             filterStatus === 'read' ? '暂无已读文章' :
             filterFavorite ? '暂无收藏文章' :
             '暂无文章'}
          </h3>
          <p className="text-gray-600">
            {filterStatus === 'unread' ? '太棒了！你已经读完所有文章' :
             filterStatus === 'read' ? '还没有阅读过任何文章，去探索吧！' :
             filterFavorite ? '还没有收藏任何文章' :
             '还没有添加任何订阅'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">排序:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">订阅:</label>
          <select
            value={selectedFeed || ''}
            onChange={(e) => setSelectedFeed(e.target.value || null)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部</option>
            {feeds.map((feed) => (
              <option key={feed.id} value={String(feed.id)}>
                {feed.title}
              </option>
            ))}
          </select>
        </div>

        {filterFavorite && (
          <Button variant="secondary" size="sm" onClick={() => router.push('/items')}>
            显示全部
          </Button>
        )}

        {filterStatus === 'unread' && (
          <Button variant="secondary" size="sm" onClick={() => router.push('/items')}>
            显示全部
          </Button>
        )}

        {showMarkAllRead && filterStatus === 'unread' && items.length > 0 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            className="ml-auto"
          >
            🔥 全部标记为已读
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="space-y-4">
        {sortedItems.map((item) => (
          <ItemCard key={item.id} item={item} feedTitle={getFeedTitle(item.feedId)} />
        ))}
      </div>

      {/* Mark All Read Confirmation Dialog */}
      <MarkAllReadConfirm
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleMarkAllRead}
        count={items.length}
        scope={feedId ? 'feed' : 'all'}
        feedTitle={feedId ? getFeedTitle(parseInt(feedId, 10)) : undefined}
        isLoading={isMarking}
      />
    </div>
  );
}
