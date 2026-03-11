'use client';

import { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';
import { Pipeline, getPipelines, deletePipeline } from '@/lib/api/pipelines';
import PipelineCard from './PipelineCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function PipelineList() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const data = await getPipelines();
      setPipelines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePipeline(id);
      setPipelines(pipelines.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/10">
        <div className="flex flex-col items-center py-10 text-center">
          <p className="mb-4 text-sm text-destructive">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm font-medium text-primary hover:underline">
            重新加载
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/settings/pipelines/new">
          <Button>创建管道</Button>
        </Link>
      </div>

      {pipelines.length === 0 ? (
        <Card className="border-border/70 bg-card/95">
          <div className="py-14 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
              <GitBranch className="size-7 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">没有管道</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
              创建管道将多个 Craft 模板组合成自动化处理流程
            </p>
            <Link href="/settings/pipelines/new">
              <Button>创建管道</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
