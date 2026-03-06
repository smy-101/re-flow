'use client';

import { useState, useEffect } from 'react';
import { CraftTemplate } from '@/lib/api/craft-templates';
import { getCraftTemplates, deleteCraftTemplate } from '@/lib/api/craft-templates';
import CraftTemplateCard from './CraftTemplateCard';
import PresetTemplateGallery from './PresetTemplateGallery';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PresetTemplate } from '@/lib/craft-templates/presets';

export default function CraftTemplateList() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPresetGallery, setShowPresetGallery] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getCraftTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCraftTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleSelectPreset = (preset: PresetTemplate) => {
    // Navigate to create page with preset data encoded in state
    router.push(`/settings/craft/new?preset=${encodeURIComponent(JSON.stringify(preset))}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">工艺模板</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowPresetGallery(true)}>
            浏览预设模板
          </Button>
          <Link href="/settings/craft/new">
            <Button>创建模板</Button>
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有工艺模板</h3>
          <p className="mt-1 text-sm text-gray-500">
            创建模板或从预设库中选择一个开始使用
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => setShowPresetGallery(true)}>
              浏览预设模板
            </Button>
            <Link href="/settings/craft/new">
              <Button>创建模板</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <CraftTemplateCard
              key={template.id}
              template={template}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PresetTemplateGallery
        isOpen={showPresetGallery}
        onClose={() => setShowPresetGallery(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
