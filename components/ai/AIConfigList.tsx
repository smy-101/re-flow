'use client';

import type { AIConfig, PresetProvider } from '@/lib/api/ai-configs';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Bot, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { AIConfigCard } from './AIConfigCard';
import {
  createAIConfig,
  deleteAIConfig,
  setDefaultConfig,
  testAIConfig,
} from '@/lib/api/ai-configs';
import { cn } from '@/lib/utils';

// Dynamic import for AIConfigModal (only loaded when needed)
const AIConfigModal = dynamic(
  () => import('./AIConfigModal').then((mod) => mod.AIConfigModal),
  { ssr: false }
);

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

  // Empty state
  if (configs.length === 0) {
    return (
      <>
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl',
            'border border-border/40 bg-card/70 backdrop-blur-xl',
            'shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]'
          )}
        >
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            />
            {/* Ambient glow */}
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center py-20 text-center">
            <div
              className={cn(
                'mb-6 flex size-20 items-center justify-center rounded-3xl',
                'bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40',
                'shadow-[0_4px_24px_rgba(0,0,0,0.04)]',
                'backdrop-blur-sm border border-border/30'
              )}
            >
              <Bot className="size-9 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-foreground">
              还没有 AI 配置
            </h3>
            <p className="mx-auto mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
              添加您的第一个 AI 配置，解锁智能摘要、翻译等功能
            </p>
            <Button size="lg" onClick={openNewConfigModal} className="gap-2">
              <Plus className="size-5" strokeWidth={1.75} />
              添加配置
            </Button>
          </div>
        </div>

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
        <Button onClick={openNewConfigModal} className="gap-2">
          <Plus className="size-4" strokeWidth={1.75} />
          添加配置
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div
          className={cn(
            'mb-4 rounded-xl border border-destructive/20',
            'bg-destructive/8 px-4 py-3 text-sm text-destructive',
            'backdrop-blur-sm'
          )}
        >
          {error}
        </div>
      )}

      {/* Config grid with staggered animation */}
      <div className="grid gap-4 md:grid-cols-2">
        {configs.map((config, index) => (
          <div
            key={config.id}
            className="animate-[configCardFadeIn_0.4s_ease-out_forwards] opacity-0"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <AIConfigCard
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
          </div>
        ))}
      </div>

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

      <style jsx>{`
        @keyframes configCardFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
