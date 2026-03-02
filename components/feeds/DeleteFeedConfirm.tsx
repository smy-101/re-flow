'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface DeleteFeedConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  feedTitle: string;
}

export default function DeleteFeedConfirm({
  isOpen,
  onClose,
  onConfirm,
  feedTitle,
}: DeleteFeedConfirmProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="确认删除订阅" size="sm">
      <div className="space-y-4">
        <Card padding="md" className="bg-amber-50 border-amber-200">
          <p className="text-amber-900">
            您即将删除订阅 <strong>&quot;{feedTitle}&quot;</strong>
          </p>
          <p className="text-sm text-amber-700 mt-2">
            此操作将同时删除该订阅下的所有文章记录，且无法恢复。
          </p>
        </Card>

        <div className="flex gap-3">
          <Button variant="danger" onClick={onConfirm} fullWidth>
            确认删除
          </Button>
          <Button variant="secondary" onClick={onClose} fullWidth>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
}
