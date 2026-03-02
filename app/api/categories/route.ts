import { NextResponse } from 'next/server';

// GET /api/categories - List available categories
export async function GET() {
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
