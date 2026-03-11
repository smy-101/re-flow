'use client';

import { useState } from 'react';
import { Rss } from 'lucide-react';
import FeedCard from './FeedCard';
import { Feed } from '@/lib/api/feeds';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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

  if (feeds.length === 0) {
    return (
      <Card className="border-border/70 bg-card/95">
        <div className="py-14 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Rss className="size-7 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">暂无订阅</h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
            开始添加你喜欢的 RSS 订阅吧
          </p>
          <Link href="/feeds/add">
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加订阅
            </Button>
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
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
          >
            上一页
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'size-10 rounded-lg text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-foreground hover:bg-secondary'
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
