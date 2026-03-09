'use client';

import { Pipeline } from '@/lib/api/pipelines';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatTimestamp } from '@/lib/time/timestamp';

interface PipelineCardProps {
  pipeline: Pipeline;
  onDelete?: (id: number) => void;
}

export default function PipelineCard({
  pipeline,
  onDelete,
}: PipelineCardProps) {
  const handleDelete = () => {
    if (window.confirm(`确定要删除管道 "${pipeline.name}" 吗？`)) {
      onDelete?.(pipeline.id);
    }
  };

  const stepCount = pipeline.steps.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {pipeline.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {stepCount} 个步骤
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Link href={`/settings/pipelines/${pipeline.id}/edit`}>
            <Button variant="secondary" size="sm">
              编辑
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </div>
      {pipeline.description && (
        <p className="text-gray-600 text-sm mb-3">{pipeline.description}</p>
      )}

      {/* Pipeline visualization */}
      <div className="bg-gray-50 rounded p-3">
        <p className="text-gray-700 font-medium mb-2 text-sm">处理流程:</p>
        <div className="flex items-center gap-2 flex-wrap">
          {pipeline.steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-white border border-gray-200 text-gray-700">
                {index + 1}. {step.name}
              </span>
              {index < pipeline.steps.length - 1 && (
                <svg
                  className="w-4 h-4 mx-1 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        创建于: {formatTimestamp(pipeline.createdAt)}
      </div>
    </div>
  );
}
