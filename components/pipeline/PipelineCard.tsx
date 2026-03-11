'use client';

import { Pipeline } from '@/lib/api/pipelines';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatTimestamp } from '@/lib/time/timestamp';
import { ChevronRight } from 'lucide-react';

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
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            {pipeline.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-500">
              {stepCount} 个步骤
            </span>
          </div>
        </div>
        <div className="ml-4 flex gap-2">
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
      {pipeline.description ? (
        <p className="mb-3 text-sm text-muted-foreground">{pipeline.description}</p>
      ) : null}

      {/* Pipeline visualization */}
      <div className="rounded bg-muted p-3">
        <p className="mb-2 text-sm font-medium text-foreground">处理流程:</p>
        <div className="flex flex-wrap items-center gap-2">
          {pipeline.steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <span className="inline-flex items-center rounded border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                {index + 1}. {step.name}
              </span>
              {index < pipeline.steps.length - 1 ? (
                <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        创建于: {formatTimestamp(pipeline.createdAt)}
      </div>
    </div>
  );
}
