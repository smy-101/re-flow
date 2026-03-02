'use client';

import { Feed } from '@/lib/api/feeds';

interface FeedPreviewProps {
  feed: Pick<Feed, 'title' | 'description' | 'siteUrl' | 'category'>;
}

export default function FeedPreview({ feed }: FeedPreviewProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <h4 className="font-semibold text-gray-900 mb-2">{feed.title}</h4>

      {feed.category && (
        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full mb-2">
          {feed.category}
        </span>
      )}

      {feed.description && (
        <p className="text-sm text-gray-600 mb-3">{feed.description}</p>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className="truncate">{feed.siteUrl}</span>
      </div>
    </div>
  );
}
