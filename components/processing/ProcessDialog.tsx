'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { getCraftTemplates, type CraftTemplate } from '@/lib/api/craft-templates';
import { getPipelines, type Pipeline } from '@/lib/api/pipelines';
import { addToQueue } from '@/lib/api/queue';
import { CATEGORY_LABELS } from '@/lib/api/craft-templates';

type TabType = 'template' | 'pipeline';

interface ProcessDialogProps {
  isOpen: boolean;
  feedItemId: number;
  onClose: () => void;
  onQueueSuccess?: () => void;
}

// Simple toast implementation (same as FeedCard)
function showToast(message: string, type: 'success' | 'error' | 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white z-50 animate-fade-in ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
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
          showToast('已加入队列', 'success');
        } else {
          showToast('该文章已在队列中', 'info');
        }
        onQueueSuccess?.();
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加入队列失败';
      setError(errorMessage);
      showToast(errorMessage, 'error');
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
    <Modal isOpen={isOpen} onClose={onClose} title="处理文章" size="md">
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'template'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('template')}
          >
            使用模板
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('pipeline')}
          >
            使用管道
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Template List */}
        {!isLoading && activeTab === 'template' && (
          <div className="space-y-2">
            {hasTemplates ? (
              <>
                <p className="text-sm text-gray-600 mb-3">选择一个模板来处理文章：</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {templates.map((template) => (
                    <label
                      key={template.id}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplateId === template.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={selectedTemplateId === template.id}
                        onChange={() => setSelectedTemplateId(template.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {template.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          分类: {CATEGORY_LABELS[template.category] ?? template.category}
                          {template.aiConfigName && ` · AI: ${template.aiConfigName}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">暂无可用模板</p>
                <a
                  href="/settings/craft"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  去创建模板 →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Pipeline List */}
        {!isLoading && activeTab === 'pipeline' && (
          <div className="space-y-2">
            {hasPipelines ? (
              <>
                <p className="text-sm text-gray-600 mb-3">选择一个管道来处理文章：</p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {pipelines.map((pipeline) => (
                    <label
                      key={pipeline.id}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPipelineId === pipeline.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pipeline"
                        value={pipeline.id}
                        checked={selectedPipelineId === pipeline.id}
                        onChange={() => setSelectedPipelineId(pipeline.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {pipeline.name}
                        </div>
                        {pipeline.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {pipeline.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {pipeline.steps.length} 个步骤
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-3">暂无可用管道</p>
                <a
                  href="/settings/pipelines"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  去创建管道 →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
        </div>
      </div>
    </Modal>
  );
}
