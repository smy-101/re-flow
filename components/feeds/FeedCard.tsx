'use client';

import Link from 'next/link';
import { useState } from 'react';
import { EllipsisVertical, RefreshCw, Rss } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { Feed, refreshFeed } from '@/lib/api/feeds';
import { formatRelativeTime } from '@/lib/time/format-relative';

interface FeedCardProps {
  feed: Feed;
  onRefresh?: (feedId: number) => void;
  onOpenSettings?: (feed: Feed) => void;
}

export default function FeedCard({ feed, onRefresh, onOpenSettings }: FeedCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'border border-border/50 bg-card/70 backdrop-blur-xl',
        'shadow-md',
        'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'hover:border-border/70 hover:bg-card/90',
        'hover:shadow-lg',
        'active:scale-[0.995]'
      )}
    >
      {/* Subtle hover gradient */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <Link
            href={`/feeds/${feed.id}`}
            className="shrink-0 transition-transform duration-300 group-hover:scale-105"
          >
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-2xl',
                'bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5',
                'text-primary shadow-sm shadow-primary/10',
                'transition-all duration-300',
                'group-hover:shadow-md group-hover:shadow-primary/15'
              )}
            >
              <Rss className="size-5" strokeWidth={1.75} />
            </div>
          </Link>

          {/* Main content */}
          <Link href={`/feeds/${feed.id}`} className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2">
              {/* Title and unread indicator */}
              <div className="flex items-center gap-2.5">
                <h3 className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-foreground/90">
                  {feed.title}
                </h3>
                {feed.unreadCount > 0 ? (
                  <span className="relative flex size-2.5 shrink-0">
                    <span className="absolute inset-0 animate-ping rounded-full bg-success/40" />
                    <span className="relative size-2.5 rounded-full bg-success shadow-sm shadow-success/50" />
                  </span>
                ) : null}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {feed.category ? (
                  <Badge variant="primary">{feed.category}</Badge>
                ) : null}
                <Badge variant={feed.unreadCount > 0 ? 'success' : 'outline'}>
                  {feed.unreadCount > 0 ? `${feed.unreadCount} 篇未读` : '已读完'}
                </Badge>
              </div>

              {/* Description */}
              {feed.description ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {feed.description}
                </p>
              ) : null}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-success/60" />
                  最后更新 {formatRelativeTime(feed.lastUpdatedAt)}
                </span>
              </div>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isRefreshing}
              onClick={handleRefresh}
              aria-label={isRefreshing ? '刷新中...' : '刷新'}
              className={cn(
                'size-9 rounded-xl',
                isRefreshing && 'opacity-70'
              )}
            >
              <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} />
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
              className="size-9 rounded-xl"
            >
              <EllipsisVertical className="size-4" />
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error ? (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/8 px-3.5 py-2.5 text-sm text-destructive backdrop-blur-sm">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  );
}
