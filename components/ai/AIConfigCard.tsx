'use client';

import type { AIConfig, PresetProvider } from '@/lib/api/ai-configs';
import { useState, useMemo, memo } from 'react';
import { MoreVertical, Bot, Sparkles, Check, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatDateTimestamp } from '@/lib/time/timestamp';
import { HealthStatusBadge } from './HealthStatusBadge';
import { TestConfigButton } from './TestConfigButton';
import { cn } from '@/lib/utils';

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

export const AIConfigCard = memo(function AIConfigCard({
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

  const providerName = useMemo(() => {
    const provider = presets.find((p) => p.id === config.providerId);
    return provider?.name || config.providerType;
  }, [presets, config.providerId, config.providerType]);

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
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'border border-border/40 bg-card/70 backdrop-blur-xl',
        'shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]',
        'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'hover:border-border/60 hover:bg-card/90',
        'hover:shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]',
        'active:scale-[0.995]'
      )}
    >
      {/* Decorative background layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Gradient overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent',
          'opacity-0 transition-opacity duration-500',
          config.isDefault && 'opacity-100',
          !config.isDefault && 'group-hover:opacity-100'
        )} />
        {/* Default star glow */}
        {config.isDefault && (
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/8 blur-3xl" />
        )}
        {/* Corner glow on hover */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            {/* Icon */}
            <div
              className={cn(
                'flex size-11 items-center justify-center rounded-xl shrink-0',
                'bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5',
                'text-primary shadow-sm shadow-primary/10',
                'transition-all duration-300',
                'group-hover:shadow-md group-hover:shadow-primary/15'
              )}
            >
              <Bot className="size-5" strokeWidth={1.75} />
            </div>

            {/* Title and meta */}
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                {config.isDefault ? (
                  <Sparkles className="size-4 text-primary shrink-0" />
                ) : null}
                <h3 className="truncate text-base font-semibold text-foreground">
                  {config.name}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-lg px-2.5 py-1',
                    'bg-primary/8 text-xs font-medium text-primary',
                    'border border-primary/10 backdrop-blur-sm'
                  )}
                >
                  {providerName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {config.model}
                </span>
              </div>
            </div>
          </div>

          {/* Menu button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className={cn(
                'flex size-8 items-center justify-center rounded-xl',
                'text-muted-foreground transition-all duration-200',
                'hover:bg-secondary/60 hover:text-foreground',
                'active:scale-95'
              )}
              aria-label="更多操作"
            >
              <MoreVertical className="size-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu ? (
              <div
                className={cn(
                  'absolute right-0 top-full z-20 mt-2 min-w-[140px]',
                  'rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
                  'animate-[dropdownFadeIn_0.2s_ease-out_forwards]'
                )}
              >
                <div className="p-1.5">
                  {!config.isDefault ? (
                    <button
                      type="button"
                      onClick={handleSetDefault}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2',
                        'text-sm text-foreground',
                        'transition-colors hover:bg-secondary/60'
                      )}
                    >
                      <Sparkles className="size-4 text-primary" />
                      设为默认
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2',
                      'text-sm text-destructive',
                      'transition-colors hover:bg-destructive/8'
                    )}
                  >
                    <X className="size-4" />
                    删除
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Status row */}
        <div className="mb-4 flex items-center justify-between">
          <HealthStatusBadge
            status={config.healthStatus}
            lastError={config.lastError || undefined}
            lastErrorAt={config.lastErrorAt}
          />
          <button
            type="button"
            onClick={() => onToggle(config)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
              'text-xs font-medium transition-all duration-200',
              'border backdrop-blur-sm',
              config.isEnabled
                ? 'border-success/30 bg-success/10 text-success hover:bg-success/15'
                : 'border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50'
            )}
          >
            {config.isEnabled ? (
              <>
                <Check className="size-3.5" />
                启用
              </>
            ) : (
              '禁用'
            )}
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border/30 pt-4">
          <span className="text-xs text-muted-foreground/70">
            创建于 {formatDateTimestamp(config.createdAt)}
          </span>
          <div className="flex items-center gap-2">
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
              className="text-xs"
            >
              编辑
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-card/95 backdrop-blur-xl">
          <div
            className={cn(
              'mx-4 w-full max-w-xs rounded-xl',
              'border border-border/50 bg-popover/95 backdrop-blur-xl',
              'p-5 shadow-[0_8px_32px_rgba(0,0,0,0.16)]'
            )}
          >
            <h4 className="mb-2 text-base font-semibold text-foreground">
              确认删除
            </h4>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
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

      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
});
