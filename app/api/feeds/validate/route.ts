import { NextRequest, NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { getUserIdFromToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

// POST /api/feeds/validate - Validate RSS feed URL
export async function POST(request: NextRequest) {
  try {
    // Get user ID from JWT token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = await getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { feedUrl } = body;

    if (!feedUrl || typeof feedUrl !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'feedUrl is required' },
        { status: 400 },
      );
    }

    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(feedUrl);
    } catch {
      return NextResponse.json(
        { valid: false, error: 'URL 格式无效' },
        { status: 200 },
      );
    }

    // Validate supported protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { valid: false, error: '只支持 HTTP 和 HTTPS 协议' },
        { status: 200 },
      );
    }

    // Try to parse the RSS feed
    try {
      const parser = new Parser({
        timeout: 10000, // 10 second timeout
        customFields: {
          feed: ['image', 'language', 'updated'],
          item: ['author', 'category'],
        },
      });

      const feed = await parser.parseURL(feedUrl);

      if (!feed) {
        return NextResponse.json(
          { valid: false, error: '无法解析此 RSS feed' },
          { status: 200 },
        );
      }

      // Extract title from feed
      const title = feed.title || extractTitleFromUrl(feedUrl);

      return NextResponse.json({
        valid: true,
        title,
      });
    } catch (parseError) {
      console.error('RSS parsing error:', parseError);
      return NextResponse.json(
        {
          valid: false,
          error: '无法解析此 RSS feed，请检查 URL 是否正确',
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('Error validating feed:', error);
    return NextResponse.json(
      {
        valid: false,
        error: '验证过程中发生错误',
      },
      { status: 200 },
    );
  }
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
