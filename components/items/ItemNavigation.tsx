'use client';

import Button from '@/components/ui/Button';

interface ItemNavigationProps {
  currentItemIndex: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ItemNavigation({
  currentItemIndex,
  totalItems,
  onPrevious,
  onNext,
}: ItemNavigationProps) {
  return (
    <nav className="flex items-center justify-between max-w-3xl mx-auto mt-8 p-4 bg-white rounded-lg border border-gray-200">
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={currentItemIndex === 0}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        上一篇
      </Button>

      <span className="text-sm text-gray-500">
        {currentItemIndex + 1} / {totalItems}
      </span>

      <Button
        variant="secondary"
        onClick={onNext}
        disabled={currentItemIndex === totalItems - 1}
      >
        下一篇
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </nav>
  );
}
