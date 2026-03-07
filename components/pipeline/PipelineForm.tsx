'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pipeline,
  CreatePipelineRequest,
  UpdatePipelineRequest,
} from '@/lib/api/pipelines';
import { createPipeline, updatePipeline } from '@/lib/api/pipelines';
import Button from '@/components/ui/Button';
import PipelineStepEditor from './PipelineStepEditor';
import type { PipelineStep } from '@/lib/db/schema';

interface PipelineFormProps {
  pipeline?: Pipeline;
  isEditing?: boolean;
}

export default function PipelineForm({
  pipeline,
  isEditing = false,
}: PipelineFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: pipeline?.name || '',
    description: pipeline?.description || '',
    steps: pipeline?.steps || ([] as PipelineStep[]),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.name || formData.name.length < 3 || formData.name.length > 50) {
        throw new Error('管道名称长度必须为 3-50 字符');
      }

      if (!formData.steps || formData.steps.length === 0) {
        throw new Error('请至少添加一个处理步骤');
      }

      if (formData.steps.length > 10) {
        throw new Error('最多支持 10 个步骤');
      }

      if (isEditing && pipeline) {
        const updateData: UpdatePipelineRequest = {
          name: formData.name,
          description: formData.description,
          steps: formData.steps,
        };
        await updatePipeline(pipeline.id, updateData);
      } else {
        const createData: CreatePipelineRequest = {
          name: formData.name,
          description: formData.description,
          steps: formData.steps,
        };
        await createPipeline(createData);
      }

      router.push('/settings/pipelines');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStepsChange = (steps: PipelineStep[]) => {
    setFormData({ ...formData, steps });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          管道名称 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="输入管道名称（3-50字符）"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          minLength={3}
          maxLength={50}
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.name.length}/50 字符
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          管道描述
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="输入管道描述（可选）"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          处理步骤 <span className="text-red-500">*</span>
        </label>
        <PipelineStepEditor
          steps={formData.steps}
          onChange={handleStepsChange}
        />
        <p className="mt-1 text-xs text-gray-500">
          已添加 {formData.steps.length}/10 个步骤
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1"
        >
          取消
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {isEditing ? '更新管道' : '创建管道'}
        </Button>
      </div>
    </form>
  );
}
