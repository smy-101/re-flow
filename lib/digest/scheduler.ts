import { getTimezoneOffset } from 'date-fns-tz';
import type { EmailDigestConfig } from '@/lib/db/schema';

/**
 * Get the number of days for a frequency
 */
export function getFrequencyWindowDays(
  frequency: EmailDigestConfig['frequency'],
  customDays: number | null,
): number {
  switch (frequency) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'custom':
      return customDays ?? 1;
    default:
      return 1;
  }
}

/**
 * Get the "wall clock" time components in a specific timezone
 * Returns year, month (1-12), day, hour, minute in the target timezone
 */
function getWallClockInTimezone(
  date: Date,
  timezone: string,
): { year: number; month: number; day: number; hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => {
    const part = parts.find((p) => p.type === type);
    return part ? parseInt(part.value, 10) : 0;
  };

  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hour: getPart('hour'),
    minute: getPart('minute'),
  };
}

/**
 * Convert wall clock time in a timezone to UTC timestamp
 */
function wallClockToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string,
): number {
  // Create a date string in ISO-like format
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  // Parse this as if it were in the target timezone
  // We use a temporary date to get the offset at this specific moment
  const tempDate = new Date(dateStr + 'Z'); // First parse as UTC
  const offsetMs = getTimezoneOffset(timezone, tempDate);

  // Adjust by subtracting the offset to get the actual UTC time
  // (if timezone is UTC+8, the local time 08:00 corresponds to 00:00 UTC)
  const utcTime = tempDate.getTime() - offsetMs;

  return Math.floor(utcTime / 1000);
}

/**
 * Calculate the next send timestamp based on config
 *
 * @param config - The digest config with frequency, customDays, sendTime, timezone
 * @returns Unix timestamp in seconds for the next send time
 */
export function calculateNextSendAt(
  config: Pick<EmailDigestConfig, 'frequency' | 'customDays' | 'sendTime' | 'timezone'>,
): number {
  const now = new Date();
  const { frequency, customDays, sendTime, timezone } = config;

  // Parse sendTime (HH:mm format)
  const [hours, minutes] = sendTime.split(':').map(Number);

  // Get current wall clock time in user's timezone
  const currentWallClock = getWallClockInTimezone(now, timezone);

  // Create the target send time for today in user's timezone
  let targetYear = currentWallClock.year;
  let targetMonth = currentWallClock.month;
  let targetDay = currentWallClock.day;

  // Check if the send time has already passed today
  const currentMinutesSinceMidnight =
    currentWallClock.hour * 60 + currentWallClock.minute;
  const targetMinutesSinceMidnight = hours * 60 + minutes;

  if (targetMinutesSinceMidnight <= currentMinutesSinceMidnight) {
    // Move to next period
    const daysToAdd = getFrequencyWindowDays(frequency, customDays);

    // Add days to the wall clock date
    // We need to create a UTC date, add days, then get components
    const tempDate = new Date(
      Date.UTC(targetYear, targetMonth - 1, targetDay, hours, minutes),
    );
    tempDate.setUTCDate(tempDate.getUTCDate() + daysToAdd);

    targetYear = tempDate.getUTCFullYear();
    targetMonth = tempDate.getUTCMonth() + 1;
    targetDay = tempDate.getUTCDate();
  }

  // Convert the target wall clock time to UTC timestamp
  return wallClockToUtc(
    targetYear,
    targetMonth,
    targetDay,
    hours,
    minutes,
    timezone,
  );
}

/**
 * Check if it's time to send based on nextSendAt
 *
 * @param nextSendAt - Unix timestamp in seconds, or null
 * @returns true if current time >= nextSendAt
 */
export function isTimeToSend(nextSendAt: number | null): boolean {
  if (nextSendAt === null) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return now >= nextSendAt;
}
