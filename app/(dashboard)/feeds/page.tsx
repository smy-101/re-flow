'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import FeedList from '@/components/feeds/FeedList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useFeeds, useUpdateFeed, useDeleteFeed, type Feed } from '@/lib/hooks/swr';

// Dynamic imports for modals (only loaded when needed)
const FeedSettingsModal = dynamic(
  () => import('@/components/feeds/FeedSettingsModal'),
  { ssr: false }
);

const DeleteFeedConfirm = dynamic(
  () => import('@/components/feeds/DeleteFeedConfirm'),
  { ssr: false }
);

export default function FeedsPage() {
  const { feeds, isLoading, isError, mutate } = useFeeds();
  const { trigger: updateFeedTrigger } = useUpdateFeed(0);
  const { trigger: deleteFeedTrigger } = useDeleteFeed();

  // Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsFeed, setSettingsFeed] = useState<Feed | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFeed, setDeleteFeed] = useState<Feed | null>(null);

  const handleOpenSettings = useCallback((feed: Feed) => {
    setSettingsFeed(feed);
    setIsSettingsOpen(true);
  }, []);

  const handleSaveSettings = useCallback(async (feed: Feed) => {
    if (!feed) return;

    try {
      await updateFeedTrigger({ feedId: feed.id, data: {
        title: feed.title,
        category: feed.category || undefined,
      }});
      mutate(); // Revalidate feeds list
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  }, [updateFeedTrigger, mutate]);

  const handleOpenDelete = useCallback((feed: Feed) => {
    setDeleteFeed(feed);
    setIsDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteFeed) return;

    try {
      await deleteFeedTrigger(deleteFeed.id);
      mutate(); // Revalidate feeds list
      setIsDeleteOpen(false);
    } catch (err) {
      console.error('Failed to delete feed:', err);
    }
  }, [deleteFeed, deleteFeedTrigger, mutate]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">加载订阅失败</p>
        <button
          onClick={() => mutate()}
          className="text-primary hover:underline"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">我的订阅</h1>
        <Link href="/feeds/add">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加订阅
          </Button>
        </Link>
      </div>

      <FeedList feeds={feeds} onOpenSettings={handleOpenSettings} />

      {/* Settings Modal */}
      {isSettingsOpen && settingsFeed ? (
        <FeedSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          feed={settingsFeed}
          onUpdate={handleSaveSettings}
          onDelete={() => {
            setIsSettingsOpen(false);
            handleOpenDelete(settingsFeed);
          }}
        />
      ) : null}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && deleteFeed ? (
        <DeleteFeedConfirm
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          feedTitle={deleteFeed.title}
        />
      ) : null}
    </div>
  );
}
