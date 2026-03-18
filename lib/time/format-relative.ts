import { timestampToDate, type TimestampValue } from './timestamp';

/**
 * Format a timestamp as a relative time string.
 *
 * @param timestamp - Unix timestamp in seconds (or milliseconds if detected)
 * @param locale - Locale for date formatting (default: 'zh-CN')
 * @returns Relative time string (e.g., "今天", "昨天", "3 天前") or formatted date
 */
export function formatRelativeTime(
  timestamp: TimestampValue,
  locale: string = 'zh-CN',
): string {
  const date = timestampToDate(timestamp);

  if (!date) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return date.toLocaleDateString(locale);
  }
}
