'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { getPipelines, type Pipeline } from '@/lib/api/pipelines';
import { getCraftTemplates, type CraftTemplate } from '@/lib/api/craft-templates';
import { updateFeed, type Feed } from '@/lib/api/feeds';

interface FeedAutoProcessSettingsProps {
  feed: Feed;
  onUpdate?: (feed: Feed) => void;
}

type ProcessingType = 'none' | 'pipeline' | 'template';

export default function FeedAutoProcessSettings({
  feed,
  onUpdate,
}: FeedAutoProcessSettingsProps) {
  const [autoProcess, setAutoProcess] = useState(feed.autoProcess ?? false);
  const [processingType, setProcessingType] = useState<ProcessingType>(() => {
    if (feed.pipelineId) return 'pipeline';
    if (feed.templateId) return 'template';
    return 'none';
  });
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(
    feed.pipelineId ?? null,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    feed.templateId ?? null,
  );

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load pipelines and templates
  useEffect(() => {
    setLoading(true);
    Promise.all([getPipelines(), getCraftTemplates()])
      .then(([pipelinesData, templatesData]) => {
        setPipelines(pipelinesData);
        setTemplates(templatesData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '加载配置失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Reset selection when type changes
  useEffect(() => {
    if (processingType === 'none') {
      setSelectedPipelineId(null);
      setSelectedTemplateId(null);
    } else if (processingType === 'pipeline') {
      setSelectedTemplateId(null);
      // Auto-select first pipeline if none selected
      setSelectedPipelineId((prev) => (prev === null && pipelines.length > 0 ? pipelines[0].id : prev));
    } else if (processingType === 'template') {
      setSelectedPipelineId(null);
      // Auto-select first template if none selected
      setSelectedTemplateId((prev) => (prev === null && templates.length > 0 ? templates[0].id : prev));
    }
  }, [processingType, pipelines, templates]);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (autoProcess && processingType === 'none') {
      setError('启用自动处理时需要选择管道或模板');
      return;
    }

    if (autoProcess && processingType === 'pipeline' && !selectedPipelineId) {
      setError('请选择一个管道');
      return;
    }

    if (autoProcess && processingType === 'template' && !selectedTemplateId) {
      setError('请选择一个模板');
      return;
    }

    setSaving(true);

    try {
      const updatedFeed = await updateFeed(feed.id, {
        autoProcess,
        pipelineId: processingType === 'pipeline' ? selectedPipelineId : null,
        templateId: processingType === 'template' ? selectedTemplateId : null,
      });

      if (updatedFeed) {
        setSuccess(true);
        onUpdate?.(updatedFeed);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-500">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">自动处理配置</h3>

      {/* Auto Process Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setAutoProcess(!autoProcess)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            autoProcess ? 'bg-blue-600' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={autoProcess}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              autoProcess ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">
          启用自动处理
        </span>
      </div>

      {autoProcess && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          {/* Processing Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              处理类型
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="processingType"
                  value="pipeline"
                  checked={processingType === 'pipeline'}
                  onChange={() => setProcessingType('pipeline')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">管道</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="processingType"
                  value="template"
                  checked={processingType === 'template'}
                  onChange={() => setProcessingType('template')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">单个模板</span>
              </label>
            </div>
          </div>

          {/* Pipeline Selection */}
          {processingType === 'pipeline' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择管道
              </label>
              {pipelines.length === 0 ? (
                <p className="text-sm text-gray-500">
                  暂无可用管道，请先创建管道
                </p>
              ) : (
                <select
                  value={selectedPipelineId ?? ''}
                  onChange={(e) => setSelectedPipelineId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择管道</option>
                  {pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name} ({pipeline.steps.length} 步)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Template Selection */}
          {processingType === 'template' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择模板
              </label>
              {templates.length === 0 ? (
                <p className="text-sm text-gray-500">
                  暂无可用模板，请先创建模板
                </p>
              ) : (
                <select
                  value={selectedTemplateId ?? ''}
                  onChange={(e) => setSelectedTemplateId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择模板</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Info text */}
          <p className="text-xs text-gray-500">
            启用后，该订阅的新文章将自动加入处理队列
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">
          配置已保存
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} disabled={saving}>
          保存配置
        </Button>
      </div>
    </div>
  );
}
