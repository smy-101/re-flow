'use client';

import PipelineForm from '@/components/pipeline/PipelineForm';

export default function NewPipelinePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">创建管道</h1>
        <p className="text-gray-600">
          将多个工艺模板组合成处理流程
        </p>
      </div>
      <PipelineForm />
    </div>
  );
}
