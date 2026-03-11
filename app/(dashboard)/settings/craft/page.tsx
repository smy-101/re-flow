'use client';

import CraftTemplateList from '@/components/craft/CraftTemplateList';

export default function CraftPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Craft 模板</h1>
        <p className="text-muted-foreground">
          管理可复用的提示词模板，用于 RSS 内容处理
        </p>
      </div>

      <CraftTemplateList />
    </div>
  );
}
