import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/auth/ip';

describe('getClientIp', () => {
  it('should use CF-Connecting-IP header when present', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'cf-connecting-ip': '203.0.113.1',
            'x-forwarded-for': '192.0.2.1',
            'x-real-ip': '198.51.100.1',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('203.0.113.1');
  });

  it('should use X-Client-IP header when CF-Connecting-IP is not present', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'x-client-ip': '203.0.113.2',
            'x-forwarded-for': '192.0.2.1',
            'x-real-ip': '198.51.100.1',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('203.0.113.2');
  });

  it('should use last IP in X-Forwarded-For when no higher priority headers exist', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'x-forwarded-for': '203.0.113.1, 192.0.2.1, 198.51.100.1',
            'x-real-ip': '198.51.100.2',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('198.51.100.1');
  });

  it('should use X-Real-IP when no other headers exist', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'x-real-ip': '198.51.100.3',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('198.51.100.3');
  });

  it('should return "unknown" when no valid IP headers are present', () => {
    const request = {
      headers: {
        get: vi.fn(() => null),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('unknown');
  });

  it('should skip invalid IPs in X-Forwarded-For and use the last valid one', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'x-forwarded-for': 'invalid-ip, 192.0.2.100, also-invalid',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('192.0.2.100');
  });

  it('should handle valid IPv4 addresses', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'cf-connecting-ip': '192.168.1.1',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should handle valid IPv6 addresses', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'cf-connecting-ip': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('should skip invalid IPv4 addresses (octets > 255)', () => {
    const request = {
      headers: {
        get: vi.fn((name: string) => {
          const headers: Record<string, string> = {
            'cf-connecting-ip': '999.999.999.999',
            'x-client-ip': '192.0.2.50',
          };
          return headers[name] || null;
        }),
      },
    } as unknown as NextRequest;

    const ip = getClientIp(request);
    expect(ip).toBe('192.0.2.50');
  });
});
