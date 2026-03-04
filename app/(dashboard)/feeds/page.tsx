'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import FeedList from '@/components/feeds/FeedList';
import FeedSettingsModal from '@/components/feeds/FeedSettingsModal';
import DeleteFeedConfirm from '@/components/feeds/DeleteFeedConfirm';
import { fetchFeeds, updateFeed, deleteFeed as deleteFeedAPI, Feed } from '@/lib/api/feeds';

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsFeed, setSettingsFeed] = useState<Feed | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteFeed, setDeleteFeed] = useState<Feed | null>(null);

  useEffect(() => {
    async function loadFeeds() {
      try {
        setLoading(true);
        const data = await fetchFeeds();
        setFeeds(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载订阅失败');
      } finally {
        setLoading(false);
      }
    }

    loadFeeds();
  }, []);

  const handleOpenSettings = (feed: Feed) => {
    setSettingsFeed(feed);
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async (feed: Feed) => {
    if (!feed) return;

    try {
      const updated = await updateFeed(feed.id, {
        title: feed.title,
        category: feed.category || undefined,
      });

      if (updated) {
        // Refresh feeds list to show updated data
        const data = await fetchFeeds();
        setFeeds(data);
      }
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleOpenDelete = (feed: Feed) => {
    setDeleteFeed(feed);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteFeed) return;

    try {
      const success = await deleteFeedAPI(deleteFeed.id);
      if (success) {
        // Refresh feeds list to remove deleted feed
        const data = await fetchFeeds();
        setFeeds(data);
      }
      setIsDeleteOpen(false);
    } catch (err) {
      console.error('Failed to delete feed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的订阅</h1>
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
      {isSettingsOpen && settingsFeed && (
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
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && deleteFeed && (
        <DeleteFeedConfirm
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDelete}
          feedTitle={deleteFeed.title}
        />
      )}
    </div>
  );
}
