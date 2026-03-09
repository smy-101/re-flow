'use client';

import { CraftTemplate } from '@/lib/api/craft-templates';
import { CATEGORY_LABELS } from '@/lib/api/craft-templates';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface CraftTemplateCardProps {
  template: CraftTemplate;
  onDelete?: (id: number) => void;
}

export default function CraftTemplateCard({
  template,
  onDelete,
}: CraftTemplateCardProps) {
  const handleDelete = () => {
    if (window.confirm(`确定要删除模板 "${template.name}" 吗？`)) {
      onDelete?.(template.id);
    }
  };

  const categoryLabel = CATEGORY_LABELS[template.category] || template.category;

  // Truncate prompt preview
  const promptPreview =
    template.promptTemplate.length > 100
      ? `${template.promptTemplate.substring(0, 100)}...`
      : template.promptTemplate;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {template.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {categoryLabel}
            </span>
            <span className="text-gray-500">
              AI: {template.aiConfigName || '未配置'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Link href={`/settings/craft/${template.id}/edit`}>
            <Button variant="secondary" size="sm">
              编辑
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </div>
      {template.description && (
        <p className="text-gray-600 text-sm mb-3">{template.description}</p>
      )}
      <div className="bg-gray-50 rounded p-3 text-sm">
        <p className="text-gray-700 font-medium mb-1">Prompt 预览:</p>
        <p className="text-gray-600 font-mono text-xs">{promptPreview}</p>
      </div>
      <div className="mt-3 text-xs text-gray-400">
        创建于: {new Date(template.createdAt * 1000).toLocaleString('zh-CN')}
      </div>
    </div>
  );
}
