'use client';

import Button from '@/components/ui/Button';

interface TestConfigButtonProps {
  onClick: () => void;
  isTesting?: boolean;
  disabled?: boolean;
  result?: { success: boolean; error?: string; latency?: number } | null;
}

export function TestConfigButton({
  onClick,
  isTesting = false,
  disabled = false,
  result,
}: TestConfigButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClick}
        loading={isTesting}
        disabled={disabled}
      >
        🧪 测试
      </Button>

      {result && (
        <span
          className={`text-sm ${
            result.success ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {result.success
            ? `✓ ${result.latency ? `${result.latency}ms` : ''}`
            : `✗ ${result.error || '失败'}`}
        </span>
      )}
    </div>
  );
}
