'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { CraftTemplate } from '@/lib/api/craft-templates';
import { getCraftTemplates, deleteCraftTemplate } from '@/lib/api/craft-templates';
import CraftTemplateCard from './CraftTemplateCard';
import PresetTemplateGallery from './PresetTemplateGallery';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PresetTemplate } from '@/lib/craft-templates/presets';

export default function CraftTemplateList() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPresetGallery, setShowPresetGallery] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getCraftTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCraftTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleSelectPreset = (preset: PresetTemplate) => {
    // Navigate to create page with preset data encoded in state
    router.push(`/settings/craft/new?preset=${encodeURIComponent(JSON.stringify(preset))}`);
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
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowPresetGallery(true)}>
            浏览预设模板
          </Button>
          <Link href="/settings/craft/new">
            <Button>创建模板</Button>
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card className="border-border/70 bg-card/95">
          <div className="py-14 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
              <FileText className="size-7 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">没有 Craft 模板</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-muted-foreground">
              创建模板或从预设库中选择一个开始使用
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={() => setShowPresetGallery(true)}>
                浏览预设模板
              </Button>
              <Link href="/settings/craft/new">
                <Button>创建模板</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <CraftTemplateCard
              key={template.id}
              template={template}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PresetTemplateGallery
        isOpen={showPresetGallery}
        onClose={() => setShowPresetGallery(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
