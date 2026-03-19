import { buildDigestContent, type DigestItem } from '@/lib/digest/content-builder';
import type { EmailDigestConfig } from '@/lib/db/schema';

export interface DigestEmailInput {
  items: DigestItem[];
  config: Pick<EmailDigestConfig, 'timezone' | 'frequency'>;
  unsubscribeUrl?: string;
  appBaseUrl?: string;
}

export interface DigestEmailResult {
  hasContent: boolean;
  itemCount: number;
  html: string;
  subject: string;
}

/**
 * Generate digest email HTML content
 *
 * @param input - Digest email input with items and config
 * @returns Email content with subject and HTML body
 */
export function getDigestEmailHtml(input: DigestEmailInput): DigestEmailResult {
  const { items, config, unsubscribeUrl, appBaseUrl } = input;

  const result = buildDigestContent({
    items,
    timezone: config.timezone,
    frequency: config.frequency,
    unsubscribeUrl,
    appBaseUrl,
  });

  // Generate subject based on frequency and item count
  let frequencyLabel: string;
  switch (config.frequency) {
    case 'daily':
      frequencyLabel = 'Daily';
      break;
    case 'weekly':
      frequencyLabel = 'Weekly';
      break;
    case 'custom':
      frequencyLabel = 'Custom';
      break;
    default:
      frequencyLabel = '';
  }

  const subject = result.hasContent
    ? `📰 Re:Flow ${frequencyLabel} Digest: ${result.itemCount} article${result.itemCount !== 1 ? 's' : ''}`
    : '📰 Re:Flow Digest: No new articles';

  return {
    hasContent: result.hasContent,
    itemCount: result.itemCount,
    html: result.htmlContent,
    subject,
  };
}

export type { DigestItem, DigestContentInput, DigestContentResult } from '@/lib/digest/content-builder';
