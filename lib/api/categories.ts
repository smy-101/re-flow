const API_BASE = '/api';

// API: Get available categories
export async function getCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/categories`);

    if (!response.ok) {
      // Return default categories on error
      return DEFAULT_CATEGORIES;
    }

    return await response.json() as Promise<string[]>;
  } catch {
    // Return default categories on error
    return DEFAULT_CATEGORIES;
  }
}

// Default categories as fallback
const DEFAULT_CATEGORIES = [
  '技术',
  '设计',
  '新闻',
  '博客',
  '科学',
  '金融',
  '娱乐',
  '体育',
];
