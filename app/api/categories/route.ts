import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';

// GET /api/categories - List available categories
export async function GET() {
  // Verify authentication (categories should be accessed by authenticated users only)
  const userId = await getAuthenticatedUser();
  if (userId instanceof NextResponse) return userId;

  // Return static list of categories
  const categories = [
    '技术',
    '设计',
    '新闻',
    '博客',
    '科学',
    '金融',
    '娱乐',
    '体育',
  ];

  return NextResponse.json(categories);
}
