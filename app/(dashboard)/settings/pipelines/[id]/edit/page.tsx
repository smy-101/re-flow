'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PipelineForm from '@/components/pipeline/PipelineForm';
import type { Pipeline } from '@/lib/api/pipelines';

export default function EditPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPipeline = async () => {
      try {
        const pipelineId = Number.parseInt(params.id as string, 10);
        if (Number.isNaN(pipelineId)) {
          throw new Error('无效的管道 ID');
        }

        const { getPipeline } = await import('@/lib/api/pipelines');
        const data = await getPipeline(pipelineId);
        setPipeline(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        router.push('/settings/pipelines');
      } finally {
        setLoading(false);
      }
    };

    loadPipeline();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
            viewBox="0 0 24 24"
          >
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/settings/pipelines')}
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
        <h1 className="text-2xl font-bold text-gray-900">编辑管道</h1>
        <p className="text-gray-600">
          编辑管道 &quot;{pipeline?.name}&quot;
        </p>
      </div>
      {pipeline && <PipelineForm pipeline={pipeline} isEditing />}
    </div>
  );
}
