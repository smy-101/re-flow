'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import ProcessDialog from './ProcessDialog';

interface ProcessButtonProps {
  feedItemId: number;
  onQueueSuccess?: () => void;
  disabled?: boolean;
  hasExistingResults?: boolean;
}

export default function ProcessButton({
  feedItemId,
  onQueueSuccess,
  disabled = false,
  hasExistingResults = false,
}: ProcessButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleQueueSuccess = useCallback(() => {
    onQueueSuccess?.();
  }, [onQueueSuccess]);

  return (
    <>
      <Button
        variant={hasExistingResults ? 'secondary' : 'primary'}
        onClick={handleOpenDialog}
        disabled={disabled}
      >
        {hasExistingResults ? '重新处理' : '处理文章'}
      </Button>

      <ProcessDialog
        isOpen={isDialogOpen}
        feedItemId={feedItemId}
        onClose={handleCloseDialog}
        onQueueSuccess={handleQueueSuccess}
      />
    </>
  );
}
