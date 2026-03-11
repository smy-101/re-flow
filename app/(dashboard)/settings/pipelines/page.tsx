'use client';

import PipelineList from '@/components/pipeline/PipelineList';

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">管道</h1>
        <p className="text-muted-foreground">
          配置自动化内容处理流程
        </p>
      </div>

      <PipelineList />
    </div>
  );
}
