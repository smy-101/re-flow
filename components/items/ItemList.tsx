'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, TriangleAlert, RefreshCw } from 'lucide-react';
import ItemCard from './ItemCard';
import MarkAllReadConfirm from './MarkAllReadConfirm';
import { fetchItems, markAllAsRead, FeedItem } from '@/lib/api/items';
import { fetchFeeds, Feed } from '@/lib/api/feeds';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

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

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.publishedAt - a.publishedAt;
      } else {
        return a.publishedAt - b.publishedAt;
      }
    });
  }, [items, sortBy]);

  const feedMap = useMemo(() => {
    return new Map(feeds.map((f) => [f.id, f.title]));
  }, [feeds]);

  const getFeedTitle = (feedId: number) => {
    return feedMap.get(feedId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 blur-xl" />
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'border border-destructive/20 bg-destructive/5 backdrop-blur-xl'
        )}
      >
        {/* Decorative glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-destructive/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center py-14 text-center">
          <div
            className={cn(
              'mb-4 flex size-14 items-center justify-center rounded-2xl',
              'bg-destructive/10 text-destructive'
            )}
          >
            <TriangleAlert className="size-7" strokeWidth={1.5} />
          </div>
          <p className="mb-4 text-sm font-medium text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2',
              'text-sm font-medium text-foreground/70',
              'transition-colors hover:text-foreground'
            )}
          >
            <RefreshCw className="size-4" />
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    const getEmptyContent = () => {
      if (filterStatus === 'unread') {
        return {
      title: '暂无未读文章',
      description: '太棒了！你已经读完所有文章了',
      icon: FileText,
    };
  }
  if (filterStatus === 'read') {
    return {
      title: '暂无已读文章',
      description: '还没有阅读过任何文章，去探索吧！',
      icon: FileText,
    };
  }
  if (filterFavorite) {
    return {
      title: '暂无收藏文章',
      description: '收藏你喜欢的文章，方便以后阅读',
      icon: FileText,
    };
  }
  return {
    title: '暂无文章',
    description: '还没有添加任何订阅',
    icon: FileText,
  };
  };

  const emptyContent = getEmptyContent();

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'border border-border/50 bg-card/70 backdrop-blur-xl',
        'shadow-md'
      )}
    >
      <div className="relative z-10 flex flex-col items-center py-16 text-center">
        <div
          className={cn(
            'mb-5 flex size-16 items-center justify-center rounded-2xl',
            'bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40',
            'backdrop-blur-sm border border-border/30'
          )}
        >
          <emptyContent.icon className="size-8 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {emptyContent.title}
        </h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
          {emptyContent.description}
        </p>
      </div>
    </div>
  );
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        className={cn(
          'mb-6 rounded-2xl border border-border/50',
          'bg-card/70 backdrop-blur-xl',
          'shadow-md',
          'transition-all duration-200',
          'hover:border-border/70 hover:shadow-lg'
        )}
      >
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:p-5">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                排序
              </label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest')}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="选择排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">最新优先</SelectItem>
                  <SelectItem value="oldest">最早优先</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                订阅
              </label>
              <Select value={selectedFeed || '__all__'} onValueChange={(value) => setSelectedFeed(value === '__all__' ? null : value)}>
                <SelectTrigger className="h-10">
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

          <div className="flex items-center gap-2 lg:ml-auto">
            {(filterFavorite || filterStatus === 'unread') && (
              <Button variant="secondary" size="sm" onClick={() => router.push('/items')}>
                显示全部
              </Button>
            )}

            {showMarkAllRead && filterStatus === 'unread' && items.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsConfirmOpen(true)}
              >
                全部标记为已读
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Item list with staggered animation */}
      <div className="space-y-4">
        {sortedItems.map((item, index) => (
          <div
            key={item.id}
            className="animate-[itemCardFadeIn_0.4s_ease-out_forwards] opacity-0"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <ItemCard item={item} feedTitle={getFeedTitle(item.feedId)} />
          </div>
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

      <style jsx>{`
        @keyframes itemCardFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
