'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import {
  PRESET_TEMPLATES,
} from '@/lib/craft-templates/presets';
import { CATEGORY_LABELS } from '@/lib/api/craft-templates';
import type { PresetTemplate } from '@/lib/craft-templates/presets';

interface PresetTemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetTemplate) => void;
}

export default function PresetTemplateGallery({
  isOpen,
  onClose,
  onSelectPreset,
}: PresetTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: '全部' },
    { value: 'summarize', label: '摘要' },
    { value: 'translate', label: '翻译' },
    { value: 'filter', label: '过滤' },
    { value: 'analyze', label: '分析' },
    { value: 'rewrite', label: '改写' },
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? PRESET_TEMPLATES
      : PRESET_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSelectPreset = (preset: PresetTemplate) => {
    onSelectPreset(preset);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="预设模板库" size="xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            筛选分类
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {filteredTemplates.map((preset) => (
            <div
              key={preset.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                  <p className="text-sm text-gray-600">{preset.description}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {CATEGORY_LABELS[preset.category]}
                </span>
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <p className="font-medium text-gray-700 mb-1">Prompt 示例:</p>
                <p className="text-gray-600 font-mono line-clamp-2">
                  {preset.promptTemplate}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSelectPreset(preset)}
                className="mt-3"
              >
                使用此模板
              </Button>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            该分类下没有预设模板
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </Modal>
  );
}
