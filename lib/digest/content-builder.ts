import type { EmailDigestConfig } from '@/lib/db/schema';

/**
 * Represents a single item in the digest
 */
export interface DigestItem {
  id: number;
  title: string;
  link: string;
  feedTitle: string;
  feedCategory: string | null;
  publishedAt: number; // Unix timestamp
  readingTime: number | null;
  aiProcessed: boolean;
  aiOutput?: string | null;
}

/**
 * Group of items by category
 */
export interface CategoryGroup {
  category: string;
  items: DigestItem[];
}

/**
 * Input for building digest content
 */
export interface DigestContentInput {
  items: DigestItem[];
  timezone: string;
  frequency: EmailDigestConfig['frequency'];
  unsubscribeUrl?: string;
  appBaseUrl?: string;
}

/**
 * Result of building digest content
 */
export interface DigestContentResult {
  hasContent: boolean;
  itemCount: number;
  htmlContent: string;
  groupedItems?: CategoryGroup[];
}

/**
 * Add UTM parameters to a URL
 */
function addUtmParams(url: string): string {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set('utm_source', 'email');
  parsedUrl.searchParams.set('utm_medium', 'digest');
  parsedUrl.searchParams.set('utm_campaign', 'rss');
  return parsedUrl.toString();
}

/**
 * Group items by category
 */
function groupByCategory(items: DigestItem[]): CategoryGroup[] {
  const groups = new Map<string, DigestItem[]>();

  for (const item of items) {
    const category = item.feedCategory || 'Uncategorized';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(item);
  }

  // Sort categories alphabetically, but put Uncategorized last
  const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  return sortedCategories.map((category) => ({
    category,
    items: groups.get(category)!,
  }));
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Build HTML email content for digest
 */
export function buildDigestContent(input: DigestContentInput): DigestContentResult {
  const { items, timezone, unsubscribeUrl, appBaseUrl } = input;

  if (items.length === 0) {
    return {
      hasContent: false,
      itemCount: 0,
      htmlContent: '',
    };
  }

  // Group items by category
  const groupedItems = groupByCategory(items);

  // Build HTML content
  const htmlParts: string[] = [];

  // Header
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDate = dateFormatter.format(now);

  htmlParts.push(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re:Flow Digest</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1f2937;
      margin: 0 0 8px 0;
      font-size: 24px;
    }
    .header .date {
      color: #6b7280;
      font-size: 14px;
    }
    .header .count {
      color: #3b82f6;
      font-size: 14px;
      margin-top: 8px;
    }
    .category {
      margin-bottom: 30px;
    }
    .category-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .item {
      background: #ffffff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .item-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .item-title a {
      color: #1f2937;
      text-decoration: none;
    }
    .item-title a:hover {
      color: #3b82f6;
    }
    .item-meta {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .item-meta .source {
      font-weight: 500;
    }
    .item-meta .reading-time {
      margin-left: 8px;
    }
    .ai-summary {
      background: #f0f9ff;
      border-left: 3px solid #3b82f6;
      padding: 12px;
      margin-top: 12px;
      font-size: 14px;
      color: #1e40af;
    }
    .ai-summary-label {
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      color: #3b82f6;
    }
    .read-more {
      display: inline-block;
      margin-top: 8px;
      font-size: 13px;
      color: #3b82f6;
      text-decoration: none;
    }
    .read-more:hover {
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 2px solid #e5e7eb;
      margin-top: 30px;
      font-size: 13px;
      color: #6b7280;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .footer-links {
      margin-top: 12px;
    }
    .footer-links a {
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📰 Re:Flow Digest</h1>
    <div class="date">${escapeHtml(formattedDate)}</div>
    <div class="count">${items.length} article${items.length !== 1 ? 's' : ''}</div>
  </div>
`);

  // Items grouped by category
  for (const group of groupedItems) {
    htmlParts.push(`
  <div class="category">
    <div class="category-title">${escapeHtml(group.category)}</div>
`);

    for (const item of group.items) {
      const linkWithUtm = addUtmParams(item.link);
      const readingTimeText = item.readingTime ? `${item.readingTime} min read` : '';

      htmlParts.push(`
    <div class="item">
      <h3 class="item-title"><a href="${escapeHtml(linkWithUtm)}">${escapeHtml(item.title)}</a></h3>
      <div class="item-meta">
        <span class="source">${escapeHtml(item.feedTitle)}</span>
        ${readingTimeText ? `<span class="reading-time">• ${readingTimeText}</span>` : ''}
      </div>
`);

      // Add AI summary if available
      if (item.aiProcessed && item.aiOutput) {
        htmlParts.push(`
      <div class="ai-summary">
        <div class="ai-summary-label">AI Summary</div>
        ${escapeHtml(item.aiOutput)}
      </div>
`);
      }

      htmlParts.push(`
      <a href="${escapeHtml(linkWithUtm)}" class="read-more">Read article →</a>
    </div>
`);
    }

    htmlParts.push(`  </div>`);
  }

  // Footer
  const viewAllUrl = appBaseUrl
    ? addUtmParams(`${appBaseUrl}/items?unread=true`)
    : '#';
  const settingsUrl = appBaseUrl
    ? addUtmParams(`${appBaseUrl}/settings/digest`)
    : '#';

  htmlParts.push(`
  <div class="footer">
    <p>You received this email because you subscribed to Re:Flow digest.</p>
    <div class="footer-links">
      <a href="${escapeHtml(viewAllUrl)}">View all in app</a>
      <a href="${escapeHtml(settingsUrl)}">Manage settings</a>
      ${unsubscribeUrl ? `<a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a>` : ''}
    </div>
  </div>
</body>
</html>
`);

  return {
    hasContent: true,
    itemCount: items.length,
    htmlContent: htmlParts.join(''),
    groupedItems,
  };
}
