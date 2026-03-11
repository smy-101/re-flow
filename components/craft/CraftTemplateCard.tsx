'use client';

import { CraftTemplate } from '@/lib/api/craft-templates';
import { CATEGORY_LABELS } from '@/lib/api/craft-templates';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatTimestamp } from '@/lib/time/timestamp';

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
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            {template.name}
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {categoryLabel}
            </span>
            <span className="text-muted-foreground">
              AI: {template.aiConfigName || '未配置'}
            </span>
          </div>
        </div>
        <div className="ml-4 flex gap-2">
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
      {template.description ? (
        <p className="mb-3 text-sm text-muted-foreground">{template.description}</p>
      ) : null}
      <div className="rounded bg-muted p-3 text-sm">
        <p className="mb-1 font-medium text-foreground">Prompt 预览:</p>
        <p className="font-mono text-xs text-muted-foreground">{promptPreview}</p>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        创建于: {formatTimestamp(template.createdAt)}
      </div>
    </div>
  );
}
