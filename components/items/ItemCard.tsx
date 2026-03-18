'use client';

import Link from 'next/link';
import { Clock3, UserRound, Bookmark } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { FeedItem } from '@/lib/api/items';
import ReadToggleButton from './ReadToggleButton';
import FavoriteButton from './FavoriteButton';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: FeedItem;
  feedTitle?: string;
}

export default function ItemCard({ item, feedTitle }: ItemCardProps) {
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

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'border border-border/40 bg-card/70 backdrop-blur-xl',
        'shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]',
        'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'hover:border-border/60 hover:bg-card/90',
        'hover:shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]',
        'active:scale-[0.995]'
      )}
    >
      {/* Decorative background layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/2 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />
        {/* Unread indicator glow */}
        {!item.isRead && (
          <div className="absolute left-0 top-1/2 h-16 w-24 -translate-y-1/2 bg-success/8 blur-2xl" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        <div className="flex items-start gap-4">
          {/* Unread dot indicator */}
          {!item.isRead ? (
            <div className="mt-2.5 shrink-0">
              <span className="relative flex size-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/40" />
                <span className="relative size-2.5 rounded-full bg-success shadow-sm shadow-success/50" />
              </span>
            </div>
          ) : null}

          {/* Main content link */}
          <Link href={`/items/${item.id}`} className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2.5">
              {/* Title */}
              <h3
                className={cn(
                  'line-clamp-2 text-lg font-semibold leading-snug',
                  'transition-colors duration-200',
                  item.isRead ? 'text-foreground/70' : 'text-foreground',
                  'group-hover:text-primary'
                )}
              >
                {item.title}
              </h3>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                {feedTitle ? (
                  <Badge variant="outline" className="max-w-[150px] truncate">
                    {feedTitle}
                  </Badge>
                ) : null}
                <Badge variant={item.isRead ? 'default' : 'success'}>
                  {item.isRead ? '已读' : '未读'}
                </Badge>
                {item.isFavorite ? (
                  <Badge variant="warning" className="gap-1">
                    <Bookmark className="size-3" fill="currentColor" />
                    已收藏
                  </Badge>
                ) : null}
              </div>
            </div>

            {/* Content preview */}
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {item.content}
            </p>

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground/70">
              {item.author ? (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5" strokeWidth={1.75} />
                  {item.author}
                </span>
              ) : null}

              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" strokeWidth={1.75} />
                {formatDate(item.publishedAt)}
              </span>

              {item.readingTime ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-muted-foreground/40" />
                  {item.readingTime} 分钟阅读
                </span>
              ) : null}
            </div>
          </Link>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-col gap-2">
            <ReadToggleButton itemId={item.id} isRead={item.isRead} />
            <FavoriteButton itemId={item.id} isFavorite={item.isFavorite} />
          </div>
        </div>
      </div>
    </article>
  );
}
