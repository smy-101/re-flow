import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/auth-helper';
import { testAIConfig } from '@/lib/ai/test';
import type { CreateAIConfigRequest } from '@/lib/api/ai-configs';

// POST /api/ai-configs/test-direct - Test an AI config without saving
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getAuthenticatedUser();
    if (userId instanceof NextResponse) return userId;

    const body = await request.json();

    // Run test
    const result = await testAIConfig(body as CreateAIConfigRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing AI config:', error);
    return NextResponse.json({ error: '测试配置失败' }, { status: 500 });
  }
}
