'use client';

import { useState } from 'react';
import FeedCard from './FeedCard';
import { Feed } from '@/lib/api/feeds';
import Card from '@/components/ui/Card';
import Link from 'next/link';

interface FeedListProps {
  feeds: Feed[];
  onOpenSettings: (feed: Feed) => void;
  pageSize?: number;
}

export default function FeedList({ feeds, onOpenSettings, pageSize = 12 }: FeedListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(feeds.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentFeeds = feeds.slice(startIndex, endIndex);

  if (feeds.length === 0) {
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
              d="M6 5c7.18 0 13 5.82 13 13M6 11c4.97 0 9 4.03 9 9M6 17c1.66 0 3 1.34 3 3"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订阅</h3>
          <p className="text-gray-600 mb-4">开始添加你喜欢的 RSS 订阅吧</p>
          <Link
            href="/feeds/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加订阅
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {currentFeeds.map((feed) => (
          <FeedCard key={feed.id} feed={feed} onOpenSettings={onOpenSettings} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一页
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
