'use client';

import Link from 'next/link';
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
    const date = new Date(timestamp);
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
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/items/${item.id}`}>
        <div className="flex items-start gap-3">
          {!item.isRead && (
            <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2" />
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
              {item.title}
            </h3>

            {feedTitle && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full mb-2">
                {feedTitle}
              </span>
            )}

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.content}</p>

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
                  {item.readingTime} 分钟
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col gap-2">
            <ReadToggleButton itemId={item.id} isRead={item.isRead} />
            <FavoriteButton itemId={item.id} isFavorite={item.isFavorite} />
          </div>
        </div>
      </Link>
    </Card>
  );
}
