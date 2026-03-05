'use client';

import type { AIConfig, PresetProvider } from '@/lib/api/ai-configs';
import { useState } from 'react';
import Button from '@/components/ui/Button';
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN');
  };

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {config.isDefault && <span className="text-lg">⭐</span>}
            <h3 className="text-base font-semibold text-gray-900">{config.name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700`}
            >
              {providerName}
            </span>
            <span className="text-sm text-gray-600">
              Model: {config.model}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            aria-label="更多操作"
          >
            ⋮
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="py-1">
                {!config.isDefault && (
                  <button
                    type="button"
                    onClick={handleSetDefault}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    设为默认
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  删除
                </button>
              </div>
            </div>
          )}
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
            className={`rounded px-2 py-1 text-xs font-medium ${
              config.isEnabled
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-50 text-gray-600'
            }`}
          >
            {config.isEnabled ? '启用 ✓' : '禁用'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Created: {formatDate(config.createdAt)}
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
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
          <div className="w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h4 className="mb-2 text-base font-semibold text-gray-900">
              确认删除
            </h4>
            <p className="mb-4 text-sm text-gray-600">
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
      )}
    </div>
  );
}
