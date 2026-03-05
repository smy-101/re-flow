'use client';

import type { AIConfig, PresetProvider } from '@/lib/api/ai-configs';
import Modal from '@/components/ui/Modal';
import { AIConfigForm } from './AIConfigForm';

interface AIConfigModalProps {
  isOpen: boolean;
  config?: AIConfig;
  presets: PresetProvider[];
  onSubmit: (data: Partial<AIConfig>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  testResult?: { success: boolean; error?: string; latency?: number } | null;
  onTest?: () => void;
  isTesting?: boolean;
}

export function AIConfigModal({
  isOpen,
  config,
  presets,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
  testResult,
  onTest,
  isTesting = false,
}: AIConfigModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="AI 配置设置">
      <AIConfigForm
        config={config}
        presets={presets}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        error={error}
        testResult={testResult}
        onTest={onTest}
        isTesting={isTesting}
      />
    </Modal>
  );
}
