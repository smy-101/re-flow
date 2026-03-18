'use client';

import { useState } from 'react';
import { Plus, Rss } from 'lucide-react';
import FeedCard from './FeedCard';
import { Feed } from '@/lib/api/feeds';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  // Empty state
  if (feeds.length === 0) {
    return (
      <EmptyState
        icon={Rss}
        title="暂无订阅"
        description="开始添加你喜欢的 RSS 订阅，打造专属的信息流"
        size="lg"
        action={{
          label: '添加订阅',
          href: '/feeds/add',
          icon: Plus,
        }}
      />
    );
  }

  return (
    <div>
      {/* Feed grid with staggered animation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentFeeds.map((feed, index) => (
          <div
            key={feed.id}
            className="animate-[feedCardFadeIn_0.5s_ease-out_forwards] opacity-0"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <FeedCard feed={feed} onOpenSettings={onOpenSettings} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={cn(
              'h-10 px-4 rounded-xl text-sm font-medium',
              'border border-border/50 bg-card/70 backdrop-blur-sm text-foreground',
              'transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
              'hover:border-border/70 hover:bg-card/90',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'active:scale-[0.98]'
            )}
          >
            上一页
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'size-10 rounded-xl text-sm font-medium',
                  'transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
                  'active:scale-[0.95]',
                  currentPage === page
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : [
                        'border border-border/50 bg-card/70 backdrop-blur-sm text-foreground',
                        'hover:border-border/70 hover:bg-card/90',
                      ]
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              'h-10 px-4 rounded-xl text-sm font-medium',
              'border border-border/50 bg-card/70 backdrop-blur-sm text-foreground',
              'transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
              'hover:border-border/70 hover:bg-card/90',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'active:scale-[0.98]'
            )}
          >
            下一页
          </button>
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes feedCardFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
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
