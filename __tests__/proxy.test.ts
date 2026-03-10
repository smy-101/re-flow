import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

vi.mock('@/lib/auth/jwt', () => ({
  getUserIdFromToken: vi.fn(),
}));

describe('proxy', () => {
  it('allows unauthenticated send-code requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', type: 'register' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows unauthenticated reset-password pages', async () => {
    const request = new NextRequest('http://localhost:3000/reset-password?email=user@example.com');

    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects unauthenticated protected API requests to login', async () => {
    const request = new NextRequest('http://localhost:3000/api/feeds', {
      method: 'GET',
    });

    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login');
  });
});
