'use client';

import { Suspense } from 'react';
import CraftTemplateForm from '@/components/craft/CraftTemplateForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function NewCraftTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">创建工艺模板</h1>
        <p className="text-muted-foreground">
          创建一个可复用的 AI 处理模板
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}>
        <CraftTemplateForm />
      </Suspense>
    </div>
  );
}
