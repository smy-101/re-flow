import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { retryJob } from '@/lib/processing/queue';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(payload.sub, 10);
    const body = await request.json();
    const { jobId } = body;

    if (!jobId || typeof jobId !== 'number') {
      return NextResponse.json({ error: 'Invalid jobId' }, { status: 400 });
    }

    const job = await retryJob(userId, jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or not in error state' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Error retrying job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
