'use client';

interface HealthStatusBadgeProps {
  status: 'unverified' | 'active' | 'error';
  lastError?: string;
  lastErrorAt?: number | null;
}

const statusConfig = {
  unverified: {
    label: '未验证',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    dot: 'bg-gray-400',
  },
  active: {
    label: '健康',
    color: 'bg-green-100 text-green-700 border-green-300',
    dot: 'bg-green-500',
  },
  error: {
    label: '异常',
    color: 'bg-red-100 text-red-700 border-red-300',
    dot: 'bg-red-500',
  },
};

export function HealthStatusBadge({
  status,
  lastError,
  lastErrorAt,
}: HealthStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div className="flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </div>
      {status === 'error' && lastError && (
        <div className="text-xs text-red-600">
          {lastError}
          {lastErrorAt && ` (${new Date(lastErrorAt * 1000).toLocaleDateString('zh-CN')})`}
        </div>
      )}
    </div>
  );
}
