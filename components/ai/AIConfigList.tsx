'use client';

import type { AIConfig, PresetProvider } from '@/lib/api/ai-configs';
import { useState } from 'react';
import { Bot } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { AIConfigCard } from './AIConfigCard';
import { AIConfigModal } from './AIConfigModal';
import {
  createAIConfig,
  deleteAIConfig,
  setDefaultConfig,
  testAIConfig,
} from '@/lib/api/ai-configs';

interface AIConfigListProps {
  configs: AIConfig[];
  presets: PresetProvider[];
  onRefresh: () => void;
}

export function AIConfigList({
  configs,
  presets,
  onRefresh,
}: AIConfigListProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testingConfigId, setTestingConfigId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; error?: string; latency?: number }>>({});

  const handleCreate = async (data: Partial<AIConfig>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createAIConfig(data as Parameters<typeof createAIConfig>[0]);
      setShowModal(false);
      setEditingConfig(undefined);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建配置失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Partial<AIConfig>) => {
    if (!editingConfig) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await fetch(`/api/ai-configs/${editingConfig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      setShowModal(false);
      setEditingConfig(undefined);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新配置失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (config: AIConfig) => {
    try {
      await deleteAIConfig(config.id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除配置失败');
    }
  };

  const handleSetDefault = async (config: AIConfig) => {
    try {
      await setDefaultConfig(config.id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置默认配置失败');
    }
  };

  const handleTest = async (config: AIConfig) => {
    setTestingConfigId(config.id);

    try {
      const result = await testAIConfig(config.id);
      setTestResults((prev) => ({
        ...prev,
        [config.id]: result,
      }));
      onRefresh();
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [config.id]: {
          success: false,
          error: err instanceof Error ? err.message : '测试失败',
        },
      }));
    } finally {
      setTestingConfigId(null);
    }
  };

  const handleToggle = async (config: AIConfig) => {
    try {
      await fetch(`/api/ai-configs/${config.id}/toggle`, {
        method: 'PUT',
        credentials: 'include',
      });
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '切换状态失败');
    }
  };

  const openNewConfigModal = () => {
    setEditingConfig(undefined);
    setShowModal(true);
  };

  const openEditModal = (config: AIConfig) => {
    setEditingConfig(config);
    setShowModal(true);
    setTestResults((prev) => {
      const result = { ...prev };
      delete result[config.id];
      return result;
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingConfig(undefined);
    setError(null);
  };

  if (configs.length === 0) {
    return (
      <>
        <Card className="border-border/70 bg-card/95">
          <div className="py-14 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
              <Bot className="size-7 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              还没有 AI 配置
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
              添加您的第一个 AI 配置来开始使用 AI 功能
            </p>
            <Button onClick={openNewConfigModal}>添加配置</Button>
          </div>
        </Card>

        {/* Modal */}
        <AIConfigModal
          isOpen={showModal}
          config={editingConfig}
          presets={presets}
          onSubmit={editingConfig ? handleUpdate : handleCreate}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
          error={error}
          testResult={editingConfig ? testResults[editingConfig.id] : null}
          onTest={editingConfig ? () => handleTest(editingConfig) : undefined}
          isTesting={testingConfigId === editingConfig?.id}
        />
      </>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button onClick={openNewConfigModal}>添加配置</Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Config list */}
      <div className="grid gap-4 md:grid-cols-2">
        {configs.map((config) => (
          <AIConfigCard
            key={config.id}
            config={config}
            presets={presets}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
            onToggle={handleToggle}
            onTest={handleTest}
            isTesting={testingConfigId === config.id}
            testResult={testResults[config.id]}
          />
        ))}
      </div>

      {/* Modal */}
      <AIConfigModal
        isOpen={showModal}
        config={editingConfig}
        presets={presets}
        onSubmit={editingConfig ? handleUpdate : handleCreate}
        onCancel={closeModal}
        isSubmitting={isSubmitting}
        error={error}
        testResult={editingConfig ? testResults[editingConfig.id] : null}
        onTest={editingConfig ? () => handleTest(editingConfig) : undefined}
        isTesting={testingConfigId === editingConfig?.id}
      />
    </div>
  );
}
