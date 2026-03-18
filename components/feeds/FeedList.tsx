'use client';

import { useState } from 'react';
import { Plus, Rss } from 'lucide-react';
import FeedCard from './FeedCard';
import { Feed } from '@/lib/api/feeds';
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

  // Empty state
  if (feeds.length === 0) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'border border-border/40 bg-card/70 backdrop-blur-xl',
          'shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]'
        )}
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          {/* Gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          />
          {/* Ambient glow */}
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/4 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center py-20 text-center">
          <div
            className={cn(
              'mb-6 flex size-20 items-center justify-center rounded-3xl',
              'bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40',
              'shadow-[0_4px_24px_rgba(0,0,0,0.04)]',
              'backdrop-blur-sm border border-border/30'
            )}
          >
            <Rss className="size-9 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-foreground">暂无订阅</h3>
          <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
            开始添加你喜欢的 RSS 订阅，打造专属的信息流
          </p>
          <Link href="/feeds/add">
            <Button size="lg" className="gap-2">
              <Plus className="size-5" strokeWidth={1.75} />
              添加订阅
            </Button>
          </Link>
        </div>
      </div>
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
              'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              'hover:border-border/70 hover:bg-card/90 hover:shadow-sm',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card/70 disabled:hover:border-border/50',
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
                  'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                  'active:scale-[0.95]',
                  currentPage === page
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : [
                        'border border-border/50 bg-card/70 backdrop-blur-sm text-foreground',
                        'hover:border-border/70 hover:bg-card/90 hover:shadow-sm',
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
              'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              'hover:border-border/70 hover:bg-card/90 hover:shadow-sm',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card/70 disabled:hover:border-border/50',
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
