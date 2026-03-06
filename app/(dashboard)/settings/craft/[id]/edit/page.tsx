'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CraftTemplateForm from '@/components/craft/CraftTemplateForm';
import type { CraftTemplate } from '@/lib/api/craft-templates';

export default function EditCraftTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<CraftTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const templateId = Number.parseInt(params.id as string, 10);
        if (Number.isNaN(templateId)) {
          throw new Error('无效的模板 ID');
        }

        const { getCraftTemplate } = await import('@/lib/api/craft-templates');
        const data = await getCraftTemplate(templateId);
        setTemplate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        router.push('/settings/craft');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/settings/craft')}
            className="text-blue-600 hover:underline"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">编辑工艺模板</h1>
        <p className="text-gray-600">
          编辑工艺模板 &quot;{template?.name}&quot;
        </p>
      </div>
      {template && <CraftTemplateForm template={template} isEditing />}
    </div>
  );
}
