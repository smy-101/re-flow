'use client';

import { useState } from 'react';
import { markAsRead } from '@/lib/api/items';
import Button from '@/components/ui/Button';

interface ReadToggleButtonProps {
  itemId: string | number;
  isRead: boolean;
  onUpdate?: (isRead: boolean) => void;
}

export default function ReadToggleButton({
  itemId,
  isRead,
  onUpdate,
}: ReadToggleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [currentIsRead, setCurrentIsRead] = useState(isRead);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !currentIsRead;
      await markAsRead(itemId, newStatus);
      setCurrentIsRead(newStatus);
      if (onUpdate) {
        onUpdate(newStatus);
      }
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={currentIsRead ? 'secondary' : 'primary'}
      size="sm"
      onClick={handleToggle}
      loading={loading}
      title={currentIsRead ? '标记为未读' : '标记为已读'}
    >
      {currentIsRead ? (
        <>
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          已读
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
          </svg>
          未读
        </>
      )}
    </Button>
  );
}
