'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { updateFeed, Feed, getCategories } from '@/lib/mock-data';

interface FeedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feed: Feed;
  onUpdate?: (feed: Feed) => void;
  onDelete?: () => void;
}

export default function FeedSettingsModal({
  isOpen,
  onClose,
  feed,
  onUpdate,
  onDelete,
}: FeedSettingsModalProps) {
  const [title, setTitle] = useState(feed.title);
  const [category, setCategory] = useState(feed.category || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categories = getCategories();

  useEffect(() => {
    setTitle(feed.title);
    setCategory(feed.category || '');
  }, [feed]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const updated = await updateFeed(feed.id, {
        title: title || feed.title,
        category: category || undefined,
      });

      if (updated && onUpdate) {
        onUpdate(updated);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="订阅设置">
      <div className="space-y-4">
        <Input
          label="订阅名称"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入订阅名称"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            分类
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">未分类</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-red-600 mb-2">危险操作</p>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              onClose();
              if (onDelete) onDelete();
            }}
          >
            删除此订阅
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} loading={saving} fullWidth>
            保存更改
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
}
