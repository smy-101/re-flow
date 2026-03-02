'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { fetchItemById, fetchItems, markAsRead, FeedItem } from '@/lib/api/items';
import { fetchFeedById, Feed } from '@/lib/api/feeds';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import ItemContent from '@/components/items/ItemContent';
import ItemNavigation from '@/components/items/ItemNavigation';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.itemId as string;

  const [item, setItem] = useState<FeedItem | null>(null);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [allItems, setAllItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [itemData, itemsData] = await Promise.all([
          fetchItemById(itemId),
          fetchItems(),
        ]);

        if (!itemData) {
          setError('文章不存在');
          return;
        }

        setItem(itemData);

        // Auto-mark as read
        if (!itemData.isRead) {
          await markAsRead(itemId, true);
          itemData.isRead = true;
        }

        // Load feed info
        const feedData = await fetchFeedById(itemData.feedId);
        setFeed(feedData);

        setAllItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载文章失败');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [itemId]);

  const currentItemIndex = allItems.findIndex((i) => i.id === parseInt(itemId, 10));

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      router.push(`/items/${allItems[currentItemIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (currentItemIndex < allItems.length - 1) {
      router.push(`/items/${allItems[currentItemIndex + 1].id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !item || !feed) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error || '文章不存在'}</p>
          <Button onClick={() => router.back()}>返回</Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Link
        href="/items"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回列表
      </Link>

      <ItemContent item={item} feedTitle={feed.title} />

      <ItemNavigation
        currentItemIndex={currentItemIndex}
        totalItems={allItems.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}
