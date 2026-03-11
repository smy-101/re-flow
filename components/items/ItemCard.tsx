'use client';

import Link from 'next/link';
import { Clock3, UserRound } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { FeedItem } from '@/lib/api/items';
import ReadToggleButton from './ReadToggleButton';
import FavoriteButton from './FavoriteButton';

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
    <Card className="border-border/70 bg-card/95 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        {!item.isRead ? <div className="mt-2 size-2 shrink-0 rounded-full bg-success" /> : null}

        <Link href={`/items/${item.id}`} className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors hover:text-primary">
              {item.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {feedTitle ? <Badge variant="outline">{feedTitle}</Badge> : null}
              {!item.isRead ? <Badge variant="success">未读</Badge> : <Badge variant="default">已读</Badge>}
              {item.isFavorite ? <Badge variant="warning">已收藏</Badge> : null}
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{item.content}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {item.author ? (
              <span className="inline-flex items-center gap-1">
                <UserRound className="size-4" />
                {item.author}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-4" />
              {formatDate(item.publishedAt)}
            </span>

            {item.readingTime ? <span>{item.readingTime} 分钟阅读</span> : null}
          </div>
        </Link>

        <div className="flex shrink-0 flex-col gap-2">
          <ReadToggleButton itemId={item.id} isRead={item.isRead} />
          <FavoriteButton itemId={item.id} isFavorite={item.isFavorite} />
        </div>
      </div>
    </Card>
  );
}
