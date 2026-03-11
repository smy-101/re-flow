'use client';

import type { AIConfig, PresetProvider } from '@/lib/api/ai-configs';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { formatDateTimestamp } from '@/lib/time/timestamp';
import { HealthStatusBadge } from './HealthStatusBadge';
import { TestConfigButton } from './TestConfigButton';

interface AIConfigCardProps {
  config: AIConfig;
  presets: PresetProvider[];
  onEdit: (config: AIConfig) => void;
  onDelete: (config: AIConfig) => void;
  onSetDefault: (config: AIConfig) => void;
  onToggle: (config: AIConfig) => void;
  onTest: (config: AIConfig) => void;
  isTesting?: boolean;
  testResult?: { success: boolean; error?: string; latency?: number } | null;
}

export function AIConfigCard({
  config,
  presets,
  onEdit,
  onDelete,
  onSetDefault,
  onToggle,
  onTest,
  isTesting,
  testResult,
}: AIConfigCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const provider = presets.find((p) => p.id === config.providerId);
  const providerName = provider?.name || config.providerType;

  const handleSetDefault = () => {
    onSetDefault(config);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete(config);
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  return (
    <div className="relative rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {config.isDefault ? <span className="text-lg">⭐</span> : null}
            <h3 className="text-base font-semibold text-foreground">{config.name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {providerName}
            </span>
            <span className="text-sm text-muted-foreground">
              Model: {config.model}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="更多操作"
          >
            ⋮
          </button>

          {showMenu ? (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-border bg-popover shadow-lg">
              <div className="py-1">
                {!config.isDefault ? (
                  <button
                    type="button"
                    onClick={handleSetDefault}
                    className="block w-full px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    设为默认
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-secondary"
                >
                  删除
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Status and metadata */}
      <div className="mb-3 flex items-center justify-between">
        <HealthStatusBadge
          status={config.healthStatus}
          lastError={config.lastError || undefined}
          lastErrorAt={config.lastErrorAt}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(config)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              config.isEnabled
                ? 'bg-success/10 text-success'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {config.isEnabled ? '启用 ✓' : '禁用'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Created: {formatDateTimestamp(config.createdAt)}
        </span>
        <TestConfigButton
          onClick={() => onTest(config)}
          isTesting={isTesting}
          disabled={!config.isEnabled}
          result={testResult}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onEdit(config)}
        >
          ✏️ 编辑
        </Button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-sm">
          <div className="w-80 rounded-lg border border-border bg-popover p-4 shadow-lg">
            <h4 className="mb-2 text-base font-semibold text-foreground">
              确认删除
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              确定要删除配置「{config.name}」吗？此操作无法撤销。
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                删除
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
