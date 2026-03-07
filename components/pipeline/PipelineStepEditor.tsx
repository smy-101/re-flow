'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getCraftTemplates, CraftTemplate } from '@/lib/api/craft-templates';
import PipelineStepItem from './PipelineStepItem';
import TemplateSelector from './TemplateSelector';
import type { PipelineStep } from '@/lib/db/schema';
import Button from '@/components/ui/Button';

interface PipelineStepEditorProps {
  steps: PipelineStep[];
  onChange: (steps: PipelineStep[]) => void;
}

export default function PipelineStepEditor({
  steps,
  onChange,
}: PipelineStepEditorProps) {
  const [templates, setTemplates] = useState<CraftTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const data = await getCraftTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((s) => s.order === active.id);
      const newIndex = steps.findIndex((s) => s.order === over.id);

      const newSteps = arrayMove(steps, oldIndex, newIndex).map(
        (step, index) => ({
          ...step,
          order: index,
        }),
      );

      onChange(newSteps);
    }
  };

  const handleAddStep = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    if (steps.length >= 10) {
      alert('最多支持 10 个步骤');
      return;
    }

    const newStep: PipelineStep = {
      templateId: template.id,
      order: steps.length,
      name: template.name,
    };

    onChange([...steps, newStep]);
  };

  const handleRemoveStep = (order: number) => {
    const newSteps = steps
      .filter((s) => s.order !== order)
      .map((step, index) => ({
        ...step,
        order: index,
      }));

    onChange(newSteps);
  };

  // Get template name for display (handle deleted templates)
  const getTemplateName = (templateId: number): string => {
    const template = templates.find((t) => t.id === templateId);
    return template?.name || '已删除模板';
  };

  const isTemplateDeleted = (templateId: number): boolean => {
    return !templates.some((t) => t.id === templateId);
  };

  if (loadingTemplates) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        加载模板列表...
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
        还没有工艺模板，请先
        <a href="/settings/craft/new" className="underline ml-1">
          创建工艺模板
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pipeline visualization */}
      {steps.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">处理流程预览:</p>
          <div className="flex items-center gap-2 flex-wrap">
            {steps.map((step, index) => (
              <div key={step.order} className="flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                    isTemplateDeleted(step.templateId)
                      ? 'bg-red-100 border border-red-200 text-red-700'
                      : 'bg-white border border-gray-200 text-gray-700'
                  }`}
                >
                  {index + 1}. {step.name}
                  {isTemplateDeleted(step.templateId) && (
                    <span className="ml-1 text-red-500">(已删除)</span>
                  )}
                </span>
                {index < steps.length - 1 && (
                  <svg
                    className="w-4 h-4 mx-1 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draggable step list */}
      {steps.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map((s) => s.order)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {steps.map((step) => (
                <PipelineStepItem
                  key={step.order}
                  step={step}
                  templateName={getTemplateName(step.templateId)}
                  isDeleted={isTemplateDeleted(step.templateId)}
                  onRemove={() => handleRemoveStep(step.order)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add step button - only show when there are existing steps */}
      {steps.length > 0 && steps.length < 10 && (
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowTemplateSelector(true)}
            className="w-full"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            添加步骤
          </Button>
        </div>
      )}

      {/* Empty state - only show when there are no steps */}
      {steps.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-3">还没有添加任何步骤</p>
          <Button
            type="button"
            onClick={() => setShowTemplateSelector(true)}
          >
            添加第一个步骤
          </Button>
        </div>
      )}

      {/* Template selector modal */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        templates={templates}
        onSelect={handleAddStep}
        onClose={() => setShowTemplateSelector(false)}
      />
    </div>
  );
}
