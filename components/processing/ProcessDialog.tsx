'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { getCraftTemplates, type CraftTemplate } from '@/lib/api/craft-templates';
import { getPipelines, type Pipeline } from '@/lib/api/pipelines';
import { addToQueue } from '@/lib/api/queue';
import { CATEGORY_LABELS } from '@/lib/api/craft-templates';
import { toast } from '@/components/ui/Toast';

type TabType = 'template' | 'pipeline';

interface ProcessDialogProps {
  isOpen: boolean;
  feedItemId: number;
  onClose: () => void;
  onQueueSuccess?: () => void;
}

export default function ProcessDialog({
  isOpen,
  feedItemId,
  onClose,
  onQueueSuccess,
}: ProcessDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('template');
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates and pipelines when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [templatesData, pipelinesData] = await Promise.all([
          getCraftTemplates(),
          getPipelines(),
        ]);
        setTemplates(templatesData);
        setPipelines(pipelinesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplateId(null);
      setSelectedPipelineId(null);
      setError(null);
      setActiveTab('template');
    }
  }, [isOpen]);

  const handleProcess = useCallback(async () => {
    if (activeTab === 'template' && !selectedTemplateId) {
      setError('请选择一个模板');
      return;
    }
    if (activeTab === 'pipeline' && !selectedPipelineId) {
      setError('请选择一个管道');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addToQueue(
        activeTab === 'template'
          ? { feedItemId, templateId: selectedTemplateId! }
          : { feedItemId, pipelineId: selectedPipelineId! },
      );

      if (result.success) {
        if (result.isNew) {
          toast.success('已加入队列');
        } else {
          toast.info('该文章已在队列中');
        }
        onQueueSuccess?.();
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加入队列失败';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeTab,
    feedItemId,
    selectedTemplateId,
    selectedPipelineId,
    onClose,
    onQueueSuccess,
  ]);

  const hasTemplates = templates.length > 0;
  const hasPipelines = pipelines.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>处理文章</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              type="button"
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'template'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('template')}
            >
              使用模板
            </button>
            <button
              type="button"
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'pipeline'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('pipeline')}
            >
              使用管道
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : null}

          {/* Error State */}
          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {/* Template List */}
          {!isLoading && activeTab === 'template' ? (
            <div className="space-y-2">
              {hasTemplates ? (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">选择一个模板来处理文章：</p>
                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {templates.map((template) => (
                      <label
                        key={template.id}
                        className={`flex cursor-pointer items-start rounded-lg border p-3 transition-colors ${
                          selectedTemplateId === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-border hover:bg-secondary'
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={selectedTemplateId === template.id}
                          onChange={() => setSelectedTemplateId(template.id)}
                          className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                        />
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {template.name}
                          </div>
                          {template.description ? (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          ) : null}
                          <div className="mt-1 text-xs text-muted-foreground">
                            分类: {CATEGORY_LABELS[template.category] ?? template.category}
                            {template.aiConfigName ? ` · AI: ${template.aiConfigName}` : ''}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-3 text-muted-foreground">暂无可用模板</p>
                  <a
                    href="/settings/craft"
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    去创建模板 →
                  </a>
                </div>
              )}
            </div>
          ) : null}

          {/* Pipeline List */}
          {!isLoading && activeTab === 'pipeline' ? (
            <div className="space-y-2">
              {hasPipelines ? (
                <>
                  <p className="mb-3 text-sm text-muted-foreground">选择一个管道来处理文章：</p>
                  <div className="max-h-60 space-y-2 overflow-y-auto">
                    {pipelines.map((pipeline) => (
                      <label
                        key={pipeline.id}
                        className={`flex cursor-pointer items-start rounded-lg border p-3 transition-colors ${
                          selectedPipelineId === pipeline.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-border hover:bg-secondary'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pipeline"
                          value={pipeline.id}
                          checked={selectedPipelineId === pipeline.id}
                          onChange={() => setSelectedPipelineId(pipeline.id)}
                          className="mt-1 h-4 w-4 text-primary focus:ring-primary"
                        />
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {pipeline.name}
                          </div>
                          {pipeline.description ? (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {pipeline.description}
                            </div>
                          ) : null}
                          <div className="mt-1 text-xs text-muted-foreground">
                            {pipeline.steps.length} 个步骤
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="mb-3 text-muted-foreground">暂无可用管道</p>
                  <a
                    href="/settings/pipelines"
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    去创建管道 →
                  </a>
                </div>
              )}
            </div>
          ) : null}

          {/* Actions */}
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button
              onClick={handleProcess}
              disabled={
                isLoading ||
                isSubmitting ||
                (activeTab === 'template' && !selectedTemplateId) ||
                (activeTab === 'pipeline' && !selectedPipelineId)
              }
              loading={isSubmitting}
            >
              开始处理
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
