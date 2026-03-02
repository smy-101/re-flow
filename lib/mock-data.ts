// Mock data types and API simulation for RSS feeds UI

export interface Feed {
  id: string;
  userId: string;
  title: string;
  feedUrl: string;
  siteUrl?: string;
  description?: string;
  category?: string;
  createdAt: number;
  lastUpdatedAt: number;
  unreadCount: number;
}

export interface FeedItem {
  id: string;
  feedId: string;
  title: string;
  link: string;
  content: string;
  publishedAt: number;
  isRead: boolean;
  isFavorite: boolean;
  author?: string;
  readingTime?: number;
}

export interface CreateFeedInput {
  feedUrl: string;
  title?: string;
  category?: string;
}

export interface UpdateFeedInput {
  title?: string;
  category?: string;
}

// Sample categories
const CATEGORIES = ['技术', '设计', '新闻', '博客', '科学', '金融', '娱乐', '体育'];

// Sample feed data
const SAMPLE_FEEDS = [
  {
    title: '阮一峰的网络日志',
    feedUrl: 'https://www.ruanyifeng.com/blog/atom.xml',
    siteUrl: 'https://www.ruanyifeng.com/blog/',
    description: '阮一峰的技术博客',
    category: '技术',
  },
  {
    title: 'Next.js Blog',
    feedUrl: 'https://nextjs.org/blog/feed.xml',
    siteUrl: 'https://nextjs.org/blog',
    description: 'Next.js 官方博客',
    category: '技术',
  },
  {
    title: 'Vercel Blog',
    feedUrl: 'https://vercel.com/blog/feed',
    siteUrl: 'https://vercel.com/blog',
    description: 'Vercel 官方博客',
    category: '技术',
  },
  {
    title: 'Dribbble Popular',
    feedUrl: 'https://dribbble.com/popular.rss',
    siteUrl: 'https://dribbble.com',
    description: 'Dribbble 热门设计',
    category: '设计',
  },
  {
    title: 'Hacker News',
    feedUrl: 'https://news.ycombinator.com/rss',
    siteUrl: 'https://news.ycombinator.com',
    description: 'Hacker News',
    category: '技术',
  },
  {
    title: '36氪',
    feedUrl: 'https://36kr.com/feed',
    siteUrl: 'https://36kr.com',
    description: '36氪快讯',
    category: '新闻',
  },
  {
    title: '少数派',
    feedUrl: 'https://sspai.com/feed',
    siteUrl: 'https://sspai.com',
    description: '少数派 - 高品质数字生活',
    category: '技术',
  },
  {
    title: 'Scientific American',
    feedUrl: 'https://www.scientificamerican.com/rss.cfm',
    siteUrl: 'https://www.scientificamerican.com',
    description: '科学美国人',
    category: '科学',
  },
  {
    title: 'Bloomberg Tech',
    feedUrl: 'https://feeds.bloomberg.com/tech/news.rss',
    siteUrl: 'https://www.bloomberg.com/technology',
    description: '彭博科技',
    category: '金融',
  },
  {
    title: 'The Verge',
    feedUrl: 'https://www.theverge.com/rss/index.xml',
    siteUrl: 'https://www.theverge.com',
    description: 'The Verge 科技资讯',
    category: '技术',
  },
];

// Sample item content templates
const ITEM_TEMPLATES = [
  { title: '如何在 {context} 中使用 {tool}', content: '本文将介绍如何在 {context} 场景下有效地使用 {tool}。通过实际案例和最佳实践，帮助你快速掌握这项技能...' },
  { title: '{tool} 发布了新版本 {version}', content: '{tool} 团队今天发布了 {version} 版本，带来了多项重要更新和性能优化。新版本包括...' },
  { title: '深入理解 {concept} 的设计原理', content: '{concept} 是现代软件开发中的核心概念。本文将从设计原理出发，深入分析其工作机制...' },
  { title: '{year}年 {context} 领域发展趋势预测', content: '随着技术的不断发展，{context} 领域正在迎来新的变革。本文将分析 {year} 年的发展趋势...' },
  { title: '如何优化 {metric} 提升 {benefit}', content: '在本文中，我们将分享优化 {metric} 的实用技巧，帮助你显著提升 {benefit}...' },
];

const TOOLS = ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python', 'AI', 'ChatGPT'];
const CONTEXTS = ['Web开发', '前端架构', '后端服务', '数据分析', '用户体验', '性能优化', '安全防护'];
const CONCEPTS = ['响应式设计', '组件化开发', '服务端渲染', '状态管理', '类型系统', 'CI/CD', '微服务架构'];

// In-memory data store
let feeds: Feed[] = [];
let feedItems: FeedItem[] = [];

// Initialize mock data
function initializeMockData(userId: string): void {
  const now = Date.now();

  // Generate feeds
  feeds = SAMPLE_FEEDS.map((feed, index) => ({
    id: `feed-${index + 1}`,
    userId,
    ...feed,
    createdAt: now - Math.random() * 90 * 24 * 60 * 60 * 1000, // 0-90 days ago
    lastUpdatedAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000, // 0-7 days ago
    unreadCount: Math.floor(Math.random() * 20), // 0-19 unread items
  }));

  // Generate items for each feed
  feedItems = [];
  feeds.forEach((feed) => {
    const itemCount = 5 + Math.floor(Math.random() * 10); // 5-15 items per feed

    for (let i = 0; i < itemCount; i++) {
      const template = ITEM_TEMPLATES[Math.floor(Math.random() * ITEM_TEMPLATES.length)];
      const tool = TOOLS[Math.floor(Math.random() * TOOLS.length)];
      const context = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)];
      const concept = CONCEPTS[Math.floor(Math.random() * CONCEPTS.length)];

      const title = template.title
        .replace('{tool}', tool)
        .replace('{context}', context)
        .replace('{concept}', concept)
        .replace('{metric}', '性能')
        .replace('{benefit}', '用户体验')
        .replace('{year}', '2026')
        .replace('{version}', `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`);

      const content = template.content
        .replace('{tool}', tool)
        .replace('{context}', context)
        .replace('{concept}', concept)
        .replace('{metric}', '性能')
        .replace('{benefit}', '用户体验')
        .replace('{year}', '2026')
        .replace('{version}', `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`);

      const isRead = Math.random() > 0.4; // 60% unread
      const publishedAt = now - (i + 1) * 2 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000;

      feedItems.push({
        id: `item-${feed.id}-${i + 1}`,
        feedId: feed.id,
        title,
        link: `${feed.siteUrl || feed.feedUrl}/item/${i + 1}`,
        content: `${content}\n\n这是一个模拟的文章内容，用于展示 RSS 阅读器的功能。在实际应用中，这里会显示从 RSS feed 解析出的真实文章内容。\n\n点击"原文链接"可以查看完整文章。`,
        publishedAt,
        isRead,
        isFavorite: Math.random() > 0.8, // 20% favorited
        author: ['张三', '李四', '王五', '匿名'][Math.floor(Math.random() * 4)],
        readingTime: 3 + Math.floor(Math.random() * 15), // 3-18 minutes
      });
    }
  });

  // Sort items by published date descending
  feedItems.sort((a, b) => b.publishedAt - a.publishedAt);
}

// Simulated network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(300 + Math.random() * 500); // 300-800ms
}

// Get current user ID (mock)
function getCurrentUserId(): string {
  return 'user-1';
}

// Initialize data if not already done
function ensureInitialized(): void {
  if (feeds.length === 0) {
    initializeMockData(getCurrentUserId());
  }
}

// API: Fetch all feeds for current user
export async function fetchFeeds(): Promise<Feed[]> {
  await randomDelay();
  ensureInitialized();
  return feeds.filter((f) => f.userId === getCurrentUserId());
}

// API: Fetch a single feed by ID
export async function fetchFeedById(feedId: string): Promise<Feed | null> {
  await randomDelay();
  ensureInitialized();
  const feed = feeds.find((f) => f.id === feedId && f.userId === getCurrentUserId());
  return feed || null;
}

// API: Create a new feed
export async function createFeed(input: CreateFeedInput): Promise<Feed> {
  await randomDelay();
  ensureInitialized();

  // Simulate feed validation
  const existingFeed = feeds.find((f) => f.feedUrl === input.feedUrl);
  if (existingFeed) {
    throw new Error('此订阅已存在');
  }

  const now = Date.now();
  const newFeed: Feed = {
    id: `feed-${Date.now()}`,
    userId: getCurrentUserId(),
    title: input.title || extractTitleFromUrl(input.feedUrl),
    feedUrl: input.feedUrl,
    siteUrl: extractSiteUrl(input.feedUrl),
    description: '新添加的订阅',
    category: input.category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    createdAt: now,
    lastUpdatedAt: now,
    unreadCount: 0,
  };

  feeds.unshift(newFeed);
  return newFeed;
}

// API: Update a feed
export async function updateFeed(feedId: string, input: UpdateFeedInput): Promise<Feed | null> {
  await randomDelay();
  ensureInitialized();

  const feedIndex = feeds.findIndex((f) => f.id === feedId && f.userId === getCurrentUserId());
  if (feedIndex === -1) {
    return null;
  }

  if (input.title !== undefined) {
    feeds[feedIndex].title = input.title;
  }
  if (input.category !== undefined) {
    feeds[feedIndex].category = input.category;
  }
  feeds[feedIndex].lastUpdatedAt = Date.now();

  return feeds[feedIndex];
}

// API: Delete a feed
export async function deleteFeed(feedId: string): Promise<boolean> {
  await randomDelay();
  ensureInitialized();

  const feedIndex = feeds.findIndex((f) => f.id === feedId && f.userId === getCurrentUserId());
  if (feedIndex === -1) {
    return false;
  }

  feeds.splice(feedIndex, 1);

  // Also delete all items for this feed
  feedItems = feedItems.filter((item) => item.feedId !== feedId);

  return true;
}

// API: Fetch all items for current user
export async function fetchItems(options?: {
  feedId?: string;
  isRead?: boolean;
  isFavorite?: boolean;
}): Promise<FeedItem[]> {
  await randomDelay();
  ensureInitialized();

  const userFeeds = feeds.filter((f) => f.userId === getCurrentUserId());
  const userFeedIds = new Set(userFeeds.map((f) => f.id));

  let items = feedItems.filter((item) => userFeedIds.has(item.feedId));

  if (options?.feedId) {
    items = items.filter((item) => item.feedId === options.feedId);
  }
  if (options?.isRead !== undefined) {
    items = items.filter((item) => item.isRead === options.isRead);
  }
  if (options?.isFavorite !== undefined) {
    items = items.filter((item) => item.isFavorite === options.isFavorite);
  }

  return items;
}

// API: Fetch a single item by ID
export async function fetchItemById(itemId: string): Promise<FeedItem | null> {
  await randomDelay();
  ensureInitialized();

  const userFeeds = feeds.filter((f) => f.userId === getCurrentUserId());
  const userFeedIds = new Set(userFeeds.map((f) => f.id));

  const item = feedItems.find((i) => i.id === itemId && userFeedIds.has(i.feedId));
  return item || null;
}

// API: Mark item as read/unread
export async function markAsRead(itemId: string, isRead: boolean): Promise<FeedItem | null> {
  await randomDelay();
  ensureInitialized();

  const item = feedItems.find((i) => i.id === itemId);
  if (!item) {
    return null;
  }

  item.isRead = isRead;

  // Update feed unread count
  const feed = feeds.find((f) => f.id === item.feedId);
  if (feed) {
    if (isRead) {
      feed.unreadCount = Math.max(0, feed.unreadCount - 1);
    } else {
      feed.unreadCount++;
    }
  }

  return item;
}

// API: Toggle item favorite status
export async function toggleFavorite(itemId: string): Promise<FeedItem | null> {
  await randomDelay();
  ensureInitialized();

  const item = feedItems.find((i) => i.id === itemId);
  if (!item) {
    return null;
  }

  item.isFavorite = !item.isFavorite;
  return item;
}

// Helper: Extract title from URL
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    return hostname.replace('www.', '');
  } catch {
    return '新订阅';
  }
}

// Helper: Extract site URL from feed URL
function extractSiteUrl(feedUrl: string): string {
  try {
    const urlObj = new URL(feedUrl);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return feedUrl;
  }
}

// Helper: Validate RSS URL (mock)
export async function validateFeedUrl(url: string): Promise<{ valid: boolean; title?: string; error?: string }> {
  await delay(500 + Math.random() * 500); // 500-1000ms for validation

  try {
    new URL(url);

    // Simulate validation
    if (url.includes('invalid') || url.includes('error')) {
      return { valid: false, error: '无法解析此 RSS feed，请检查 URL 是否正确' };
    }

    return {
      valid: true,
      title: extractTitleFromUrl(url),
    };
  } catch {
    return { valid: false, error: 'URL 格式无效' };
  }
}

// Get categories
export function getCategories(): string[] {
  return [...CATEGORIES];
}
