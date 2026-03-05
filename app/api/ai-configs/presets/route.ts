import { NextResponse } from 'next/server';
import { PRESET_PROVIDERS } from '@/lib/ai/providers';

// GET /api/ai-configs/presets - Get all preset providers
export async function GET() {
  try {
    return NextResponse.json({ providers: PRESET_PROVIDERS });
  } catch (error) {
    console.error('Error fetching preset providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preset providers' },
      { status: 500 },
    );
  }
}
