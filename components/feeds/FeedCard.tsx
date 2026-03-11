'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EllipsisVertical, RefreshCw, Rss } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
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
        if (result.itemsAdded > 0) {
          toast.success(`成功刷新，新增 ${result.itemsAdded} 篇文章`);
        } else {
          toast.info('刷新成功，没有检测到新内容');
        }

        onRefresh?.(feed.id);
      } else {
        const errorMessage = result.error || '刷新失败';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch {
      const errorMessage = '网络错误，请稍后重试';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="h-full border-border/70 bg-card/95 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <Link href={`/feeds/${feed.id}`} className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Rss className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-foreground">{feed.title}</h3>
                {feed.unreadCount > 0 ? <span className="size-2 rounded-full bg-success" /> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {feed.category ? <Badge variant="primary">{feed.category}</Badge> : null}
                <Badge variant={feed.unreadCount > 0 ? 'success' : 'outline'}>
                  {feed.unreadCount > 0 ? `${feed.unreadCount} 篇未读` : '已读完'}
                </Badge>
              </div>
              {feed.description ? (
                <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{feed.description}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>最后更新 {formatDate(feed.lastUpdatedAt)}</span>
                <span>{feed.feedUrl}</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isRefreshing}
            onClick={handleRefresh}
            aria-label={isRefreshing ? '刷新中...' : '刷新'}
            className={cn(isRefreshing ? 'opacity-70' : '')}
          >
            <RefreshCw className={cn('size-4', isRefreshing ? 'animate-spin' : '')} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenSettings?.(feed);
            }}
            aria-label="设置"
          >
            <EllipsisVertical className="size-4" />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </Card>
  );
}
