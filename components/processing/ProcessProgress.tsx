'use client';

interface ProcessProgressProps {
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string | null;
}

export default function ProcessProgress({
  status,
  errorMessage,
}: ProcessProgressProps) {
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        <span>等待处理</span>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
        <span>处理中...</span>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>处理完成</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>处理失败</span>
        </div>
        {errorMessage && (
          <p className="text-xs text-red-500 ml-6">{errorMessage}</p>
        )}
      </div>
    );
  }

  return null;
}
