import type { FeedItem, Feed } from '@/lib/db/schema';

export interface PromptContext {
  // RSS Item variables
  title: string;
  content: string;
  author: string | null;
  link: string;
  publishedAt: number;
  readingTime: number | null;
  // Feed variables
  feedTitle: string;
  feedUrl: string;
  // Pipeline variable
  prevOutput?: string;
}

/**
 * Create prompt context from feed item and feed data
 */
export function createPromptContext(
  item: FeedItem,
  feed: Feed,
  prevOutput?: string,
): PromptContext {
  return {
    title: item.title,
    content: item.content,
    author: item.author,
    link: item.link,
    publishedAt: item.publishedAt,
    readingTime: item.readingTime,
    feedTitle: feed.title,
    feedUrl: feed.feedUrl,
    prevOutput,
  };
}

/**
 * Render a prompt template with context variables
 * Supports variables like {{title}}, {{content}}, {{author}}, etc.
 */
export function renderPrompt(template: string, context: PromptContext): string {
  let rendered = template;

  // RSS Item variables
  rendered = rendered.replace(/\{\{title\}\}/g, context.title);
  rendered = rendered.replace(/\{\{content\}\}/g, context.content);
  rendered = rendered.replace(
    /\{\{author\}\}/g,
    context.author ?? 'Unknown Author',
  );
  rendered = rendered.replace(/\{\{link\}\}/g, context.link);
  rendered = rendered.replace(
    /\{\{publishedAt\}\}/g,
    formatDate(context.publishedAt),
  );
  rendered = rendered.replace(
    /\{\{readingTime\}\}/g,
    context.readingTime?.toString() ?? 'Unknown',
  );

  // Feed variables
  rendered = rendered.replace(/\{\{feedTitle\}\}/g, context.feedTitle);
  rendered = rendered.replace(/\{\{feedUrl\}\}/g, context.feedUrl);

  // Pipeline variable - prev_output
  if (context.prevOutput !== undefined) {
    rendered = rendered.replace(/\{\{prev_output\}\}/g, context.prevOutput);
  }

  return rendered;
}

/**
 * Format Unix timestamp to readable date string
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Validate that a template can be rendered with the given context
 * Returns list of missing required variables
 */
export function validateTemplate(
  template: string,
  context: Partial<PromptContext>,
): string[] {
  const variablePattern = /\{\{(\w+)\}\}/g;
  const missing: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = variablePattern.exec(template)) !== null) {
    const varName = match[1];
    if (!(varName in context) || context[varName as keyof PromptContext] === undefined) {
      if (!missing.includes(varName)) {
        missing.push(varName);
      }
    }
  }

  return missing;
}
