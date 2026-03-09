const LIKELY_MILLISECOND_THRESHOLD = 10_000_000_000;

export type TimestampValue = number | null | undefined;

export function getCurrentUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function isLikelyMillisecondTimestamp(timestamp: number): boolean {
  return Math.abs(timestamp) >= LIKELY_MILLISECOND_THRESHOLD;
}

export function normalizeTimestampToSeconds(timestamp: TimestampValue): TimestampValue {
  if (timestamp == null) {
    return timestamp;
  }

  if (!Number.isFinite(timestamp)) {
    return timestamp;
  }

  if (isLikelyMillisecondTimestamp(timestamp)) {
    return Math.trunc(timestamp / 1000);
  }

  return Math.trunc(timestamp);
}

export function timestampToDate(timestamp: TimestampValue): Date | null {
  const normalizedTimestamp = normalizeTimestampToSeconds(timestamp);

  if (normalizedTimestamp == null) {
    return null;
  }

  return new Date(normalizedTimestamp * 1000);
}

export function formatTimestamp(
  timestamp: TimestampValue,
  locale: string = 'zh-CN',
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = timestampToDate(timestamp);

  if (!date) {
    return '';
  }

  return date.toLocaleString(locale, options);
}

export function formatDateTimestamp(
  timestamp: TimestampValue,
  locale: string = 'zh-CN',
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = timestampToDate(timestamp);

  if (!date) {
    return '';
  }

  return date.toLocaleDateString(locale, options);
}
