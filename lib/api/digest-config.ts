/**
 * Client-side API functions for digest config management
 */

export interface DigestFilter {
  id?: number;
  configId?: number;
  filterType: 'all' | 'category' | 'feed';
  filterValue?: string | null;
}

export interface DigestConfig {
  id?: number;
  userId?: number;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays: number | null;
  sendTime: string;
  timezone: string;
  markAsRead: boolean;
  pausedDueToFailures: boolean;
  consecutiveFailures: number;
  lastSentAt: number | null;
  nextSendAt: number | null;
  filters: DigestFilter[];
  emailVerified: boolean;
}

export interface UpdateDigestConfigInput {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number | null;
  sendTime: string;
  timezone: string;
  markAsRead: boolean;
  filters: DigestFilter[];
}

/**
 * Get the current user's digest config
 */
export async function getDigestConfig(): Promise<DigestConfig> {
  const response = await fetch('/api/digest-config');

  if (!response.ok) {
    throw new Error('Failed to fetch digest config');
  }

  return response.json();
}

/**
 * Create or update digest config
 */
export async function updateDigestConfig(
  input: UpdateDigestConfigInput,
): Promise<DigestConfig> {
  const response = await fetch('/api/digest-config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update digest config');
  }

  return response.json();
}

/**
 * Delete digest config
 */
export async function deleteDigestConfig(): Promise<void> {
  const response = await fetch('/api/digest-config', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete digest config');
  }
}

/**
 * Format next send time for display
 */
export function formatNextSendAt(
  nextSendAt: number | null,
  timezone: string,
): string | null {
  if (!nextSendAt) return null;

  const date = new Date(nextSendAt * 1000);
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return formatter.format(date);
}

/**
 * Format last sent time for display
 */
export function formatLastSentAt(
  lastSentAt: number | null,
  timezone: string,
): string | null {
  if (!lastSentAt) return null;

  const date = new Date(lastSentAt * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return '刚刚';
  } else if (diffHours < 24) {
    return `${diffHours} 小时前`;
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  }
}

/**
 * Get common timezone options
 */
export function getCommonTimezones(): { value: string; label: string }[] {
  return [
    { value: 'UTC', label: 'UTC' },
    { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
    { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
    { value: 'Asia/Seoul', label: '韩国标准时间 (UTC+9)' },
    { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)' },
    { value: 'America/New_York', label: '美国东部时间' },
    { value: 'America/Los_Angeles', label: '美国太平洋时间' },
    { value: 'America/Chicago', label: '美国中部时间' },
    { value: 'Europe/London', label: '伦敦时间' },
    { value: 'Europe/Paris', label: '巴黎时间 (UTC+1)' },
    { value: 'Europe/Berlin', label: '柏林时间 (UTC+1)' },
    { value: 'Australia/Sydney', label: '悉尼时间 (UTC+10/11)' },
  ];
}
