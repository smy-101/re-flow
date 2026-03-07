'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PipelineStep } from '@/lib/db/schema';
import Button from '@/components/ui/Button';

interface PipelineStepItemProps {
  step: PipelineStep;
  templateName: string;
  isDeleted: boolean;
  onRemove: () => void;
}

export default function PipelineStepItem({
  step,
  templateName,
  isDeleted,
  onRemove,
}: PipelineStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.order });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
        isDragging ? 'shadow-lg border-blue-300 z-10' : 'border-gray-200'
      } ${isDeleted ? 'border-red-200 bg-red-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
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
            d="M4 8h16M4 16h16"
          />
        </svg>
      </button>

      {/* Step number */}
      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-medium text-gray-600">
        {step.order + 1}
      </span>

      {/* Step name */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isDeleted ? 'text-red-700' : 'text-gray-900'
          }`}
        >
          {templateName}
          {isDeleted && (
            <span className="ml-2 text-xs text-red-500">(模板已删除)</span>
          )}
        </p>
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={onRemove}
        className="flex-shrink-0"
      >
        <svg
          className="w-4 h-4"
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
      </Button>
    </div>
  );
}
