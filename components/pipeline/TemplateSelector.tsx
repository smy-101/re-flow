'use client';

import { CraftTemplate, CATEGORY_LABELS } from '@/lib/api/craft-templates';
import Button from '@/components/ui/Button';

interface TemplateSelectorProps {
  isOpen: boolean;
  templates: CraftTemplate[];
  onSelect: (templateId: number) => void;
  onClose: () => void;
}

export default function TemplateSelector({
  isOpen,
  templates,
  onSelect,
  onClose,
}: TemplateSelectorProps) {
  if (!isOpen) return null;

  // Group templates by category
  const groupedTemplates = templates.reduce(
    (acc, template) => {
      const category = template.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    },
    {} as Record<string, CraftTemplate[]>,
  );

  const categoryOrder = [
    'summarize',
    'translate',
    'filter',
    'analyze',
    'rewrite',
    'custom',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">选择模板</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">还没有可用的工艺模板</p>
              <a
                href="/settings/craft/new"
                className="text-blue-600 hover:underline text-sm"
              >
                创建工艺模板
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryOrder.map((category) => {
                const categoryTemplates = groupedTemplates[category];
                if (!categoryTemplates || categoryTemplates.length === 0)
                  return null;

                return (
                  <div key={category}>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {CATEGORY_LABELS[category] || category}
                    </h4>
                    <div className="space-y-2">
                      {categoryTemplates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => {
                            onSelect(template.id);
                            onClose();
                          }}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {template.name}
                              </p>
                              {template.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            <svg
                              className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
