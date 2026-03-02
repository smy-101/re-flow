'use client';

import { FeedItem } from '@/lib/api/items';
import Card from '@/components/ui/Card';
import ReadToggleButton from './ReadToggleButton';
import FavoriteButton from './FavoriteButton';

interface ItemContentProps {
  item: FeedItem;
  feedTitle: string;
}

export default function ItemContent({ item, feedTitle }: ItemContentProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            {feedTitle}
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
        </div>
      </header>

      {/* Content */}
      <Card padding="lg">
        <div className="prose prose-gray max-w-none">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {item.content}
          </p>
        </div>
      </Card>

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
  );
}
