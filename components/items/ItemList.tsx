'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, TriangleAlert } from 'lucide-react';
import ItemCard from './ItemCard';
import MarkAllReadConfirm from './MarkAllReadConfirm';
import { fetchItems, markAllAsRead, FeedItem } from '@/lib/api/items';
import { fetchFeeds, Feed } from '@/lib/api/feeds';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

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
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/10">
        <div className="flex flex-col items-center py-10 text-center">
          <TriangleAlert className="mb-4 size-10 text-destructive" />
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary hover:underline">
            重新加载
          </button>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-border/70 bg-card/95">
        <div className="py-14 text-center">
          <FileText className="mx-auto mb-4 size-14 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {filterStatus === 'unread' ? '暂无未读文章' :
             filterStatus === 'read' ? '暂无已读文章' :
             filterFavorite ? '暂无收藏文章' :
             '暂无文章'}
          </h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
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
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">排序</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest')}>
              <SelectTrigger>
                <SelectValue placeholder="选择排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新优先</SelectItem>
                <SelectItem value="oldest">最早优先</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">订阅</label>
            <Select value={selectedFeed || '__all__'} onValueChange={(value) => setSelectedFeed(value === '__all__' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="全部订阅" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部</SelectItem>
                {feeds.map((feed) => (
                  <SelectItem key={feed.id} value={String(feed.id)}>
                    {feed.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            className="lg:ml-auto"
          >
            全部标记为已读
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedItems.map((item) => (
          <ItemCard key={item.id} item={item} feedTitle={getFeedTitle(item.feedId)} />
        ))}
      </div>

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
