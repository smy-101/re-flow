'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CraftTemplate,
  CreateCraftTemplateRequest,
  UpdateCraftTemplateRequest,
  CATEGORY_OPTIONS,
} from '@/lib/api/craft-templates';
import { getAIConfigs } from '@/lib/api/ai-configs';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PromptEditor from './PromptEditor';
import type { AIConfig } from '@/lib/api/ai-configs';
import type { PresetTemplate } from '@/lib/craft-templates/presets';

interface CraftTemplateFormProps {
  template?: CraftTemplate;
  isEditing?: boolean;
}

function CraftTemplateFormInner({
  template,
  isEditing = false,
}: CraftTemplateFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
  const [loadingAiConfigs, setLoadingAiConfigs] = useState(true);

  const [formData, setFormData] = useState(() => ({
    name: template?.name || '',
    description: template?.description || '',
    aiConfigId: template?.aiConfigId || 0,
    promptTemplate: template?.promptTemplate || '',
    category: template?.category || ('custom' as CraftTemplate['category']),
  }));

  useEffect(() => {
    loadAiConfigs();
    if (!isEditing) {
      const presetParam = searchParams.get('preset');
      if (presetParam) {
        try {
          const preset = JSON.parse(decodeURIComponent(presetParam)) as PresetTemplate;
          setFormData({
            name: preset.name,
            description: preset.description,
            aiConfigId: 0,
            promptTemplate: preset.promptTemplate,
            category: preset.category,
          });
          // Remove preset from URL to prevent re-loading
          router.replace('/settings/craft/new', { scroll: false });
        } catch (err) {
          console.error('Failed to parse preset from URL:', err);
        }
      }
    }
  }, [searchParams, isEditing, router]);

  const loadAiConfigs = async () => {
    try {
      setLoadingAiConfigs(true);
      const configs = await getAIConfigs();
      setAiConfigs(configs);
    } catch (err) {
      console.error('Failed to load AI configs:', err);
    } finally {
      setLoadingAiConfigs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || formData.name.length < 3 || formData.name.length > 50) {
        throw new Error('模板名称长度必须在 3-50 个字符之间');
      }

      if (!formData.promptTemplate) {
        throw new Error('Prompt 模板不能为空');
      }

      if (!formData.aiConfigId) {
        throw new Error('请选择关联的 AI 配置');
      }

      if (isEditing && template) {
        const updateData: UpdateCraftTemplateRequest = {
          name: formData.name,
          description: formData.description,
          aiConfigId: formData.aiConfigId,
          promptTemplate: formData.promptTemplate,
          category: formData.category,
        };
        await import('@/lib/api/craft-templates').then(
          ({ updateCraftTemplate }) => updateCraftTemplate(template.id, updateData),
        );
      } else {
        const createData: CreateCraftTemplateRequest = {
          name: formData.name,
          description: formData.description,
          aiConfigId: formData.aiConfigId,
          promptTemplate: formData.promptTemplate,
          category: formData.category,
        };
        await import('@/lib/api/craft-templates').then(
          ({ createCraftTemplate }) => createCraftTemplate(createData),
        );
      }

      router.push('/settings/craft');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
          模板名称 <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="输入模板名称（3-50字符）"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          required
          minLength={3}
          maxLength={50}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {formData.name.length}/50 字符
        </p>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
          模板描述
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="输入模板描述（可选）"
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-2 block text-sm font-medium text-foreground">
          分类
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value as CraftTemplate['category'],
            })
          }
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="aiConfigId" className="mb-2 block text-sm font-medium text-foreground">
          关联 AI 配置 <span className="text-destructive">*</span>
        </label>
        {loadingAiConfigs ? (
          <div className="flex items-center text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span className="ml-2">加载 AI 配置...</span>
          </div>
        ) : (
          <>
            <select
              id="aiConfigId"
              value={formData.aiConfigId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  aiConfigId: Number.parseInt(e.target.value, 10),
                })
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value={0}>选择 AI 配置</option>
              {aiConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                  {config.isDefault && ' (默认)'}
                </option>
              ))}
            </select>
            {aiConfigs.length === 0 && (
              <p className="mt-1 text-xs text-destructive">
                还没有 AI 配置，请先
                <a href="/settings/ai" className="underline">
                  创建 AI 配置
                </a>
              </p>
            )}
          </>
        )}
      </div>

      <PromptEditor
        value={formData.promptTemplate}
        onChange={(value) => setFormData({ ...formData, promptTemplate: value })}
        placeholder="输入 Prompt 模板，使用 {{variable}} 插入变量..."
      />

      <div className="flex gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {isEditing ? '更新模板' : '创建模板'}
        </Button>
      </div>
    </form>
  );
}

export default function CraftTemplateForm(props: CraftTemplateFormProps) {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner size="lg" /></div>}>
      <CraftTemplateFormInner {...props} />
    </Suspense>
  );
}
