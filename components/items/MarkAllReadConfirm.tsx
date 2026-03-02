'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface MarkAllReadConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  scope: 'all' | 'feed';
  feedTitle?: string;
  isLoading?: boolean;
}

export default function MarkAllReadConfirm({
  isOpen,
  onClose,
  onConfirm,
  count,
  scope,
  feedTitle,
  isLoading = false,
}: MarkAllReadConfirmProps) {
  const getScopeText = () => {
    if (scope === 'feed' && feedTitle) {
      return `本订阅 "${feedTitle}" 共 ${count} 篇未读文章`;
    }
    return `共 ${count} 篇未读文章`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="确认标记为已读" size="sm">
      <div className="space-y-4">
        <Card padding="md" className="bg-blue-50 border-blue-200">
          <p className="text-blue-900 font-medium">
            您即将标记所有未读文章为已读
          </p>
          <p className="text-sm text-blue-700 mt-2">
            {getScopeText()}将被标记为已读
          </p>
          <p className="text-sm text-blue-700 mt-2">
            此操作不会删除文章，您可以稍后在&ldquo;已读&rdquo;中查看它们。
          </p>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={onConfirm}
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? '标记中...' : '确认标记为已读'}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
          >
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
}
