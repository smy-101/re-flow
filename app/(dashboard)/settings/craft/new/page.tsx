'use client';

import CraftTemplateForm from '@/components/craft/CraftTemplateForm';

export default function NewCraftTemplatePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">创建工艺模板</h1>
        <p className="text-gray-600">
          创建一个可复用的 AI 处理模板
        </p>
      </div>
      <CraftTemplateForm />
    </div>
  );
}
