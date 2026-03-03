import { NextRequest } from 'next/server';

/**
 * Get the real client IP address from the request.
 * Prioritizes trusted proxy headers over client-settable headers.
 *
 * Priority order:
 * 1. CF-Connecting-IP (Cloudflare)
 * 2. X-Client-IP (some proxies)
 * 3. Last IP in X-Forwarded-For (most recently added by trusted proxy)
 * 4. X-Real-IP (Nginx)
 * 5. Falls back to 'unknown'
 *
 * @param request - NextRequest object
 * @returns Client IP address or 'unknown'
 */
export function getClientIp(request: NextRequest): string {
  // Try Cloudflare's connecting IP first (most reliable if using CF)
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp)) {
    return cfConnectingIp;
  }

  // Try X-Client-IP header (set by some proxies)
  const xClientIp = request.headers.get('x-client-ip');
  if (xClientIp && isValidIp(xClientIp)) {
    return xClientIp;
  }

  // Try X-Forwarded-For, get the last IP (most recent proxy)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // The last IP is the most recently added by a trusted proxy
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    for (let i = ips.length - 1; i >= 0; i--) {
      if (isValidIp(ips[i])) {
        return ips[i];
      }
    }
  }

  // Try X-Real-IP (Nginx and others)
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp && isValidIp(xRealIp)) {
    return xRealIp;
  }

  // Fallback to unknown if no valid IP found
  return 'unknown';
}

/**
 * Validate if a string is a valid IPv4 or IPv6 address.
 *
 * @param ip - IP address string to validate
 * @returns True if valid IP, false otherwise
 */
function isValidIp(ip: string): boolean {
  if (!ip || ip === 'unknown') {
    return false;
  }

  // Basic IPv4 validation (simplified)
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(ip)) {
    // Check each octet is 0-255
    const octets = ip.split('.');
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Basic IPv6 validation (simplified)
  // IPv6 contains colons and hexadecimal characters
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
  return ipv6Pattern.test(ip);
}
