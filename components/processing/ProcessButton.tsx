'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import ProcessDialog from './ProcessDialog';
import type { ProcessingResult } from '@/lib/api/processing-results';

interface ProcessButtonProps {
  feedItemId: number;
  onProcessingComplete?: (result: ProcessingResult) => void;
  disabled?: boolean;
  hasExistingResults?: boolean;
}

export default function ProcessButton({
  feedItemId,
  onProcessingComplete,
  disabled = false,
  hasExistingResults = false,
}: ProcessButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleProcessingStart = useCallback(() => {
    setIsProcessing(true);
    setIsDialogOpen(false);
  }, []);

  const handleProcessingComplete = useCallback(
    (result: ProcessingResult) => {
      setIsProcessing(false);
      onProcessingComplete?.(result);
    },
    [onProcessingComplete],
  );

  const handleProcessingError = useCallback(() => {
    setIsProcessing(false);
  }, []);

  return (
    <>
      <Button
        variant={hasExistingResults ? 'secondary' : 'primary'}
        onClick={handleOpenDialog}
        disabled={disabled || isProcessing}
        loading={isProcessing}
      >
        {isProcessing
          ? '处理中...'
          : hasExistingResults
            ? '重新处理'
            : '处理文章'}
      </Button>

      <ProcessDialog
        isOpen={isDialogOpen}
        feedItemId={feedItemId}
        onClose={handleCloseDialog}
        onProcessingStart={handleProcessingStart}
        onProcessingComplete={handleProcessingComplete}
        onProcessingError={handleProcessingError}
      />
    </>
  );
}
