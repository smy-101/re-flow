'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { fetchFeedById, Feed } from '@/lib/api/feeds';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import ItemList from '@/components/items/ItemList';

export default function FeedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const feedId = params.feedId as string;

  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true);
        const data = await fetchFeedById(feedId);
        setFeed(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载订阅失败');
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [feedId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !feed) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error || '订阅不存在'}</p>
          <Button onClick={() => router.back()}>返回</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/feeds"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{feed.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {feed.category && (
                  <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                    {feed.category}
                  </span>
                )}
                <span>{feed.unreadCount} 篇未读</span>
                <a
                  href={feed.siteUrl || feed.feedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  访问网站 →
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          未读 ({feed.unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          已读
        </Button>
      </div>

      {/* Items */}
      <ItemList feedId={feedId} filterStatus={filter} showMarkAllRead={filter === 'unread'} />
    </div>
  );
}
