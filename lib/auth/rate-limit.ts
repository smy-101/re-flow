interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Default rate limit settings
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 5;

// Verification rate limit settings (15 minutes window)
const VERIFY_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const VERIFY_EMAIL_MAX_REQUESTS = 5; // 5 times per 15 minutes per email
const VERIFY_IP_MAX_REQUESTS = 10; // 10 times per 15 minutes per IP

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  identifier: string,
  config?: RateLimitConfig,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const windowMs = config?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = config?.maxRequests ?? DEFAULT_MAX_REQUESTS;

  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(identifier, newEntry);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment count within current window
  entry.count++;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Check combined rate limit for verification attempts (email + IP)
 * Returns blocked if either limit is exceeded
 */
export function checkVerificationRateLimit(
  email: string,
  ip: string,
): {
  allowed: boolean;
  blockedBy?: 'email' | 'ip';
  remaining?: number;
  resetTime?: number;
} {
  const emailKey = `verify:${email}`;
  const ipKey = `verify:${ip}`;

  const emailResult = checkRateLimit(emailKey, {
    windowMs: VERIFY_WINDOW_MS,
    maxRequests: VERIFY_EMAIL_MAX_REQUESTS,
  });

  const ipResult = checkRateLimit(ipKey, {
    windowMs: VERIFY_WINDOW_MS,
    maxRequests: VERIFY_IP_MAX_REQUESTS,
  });

  if (!emailResult.allowed) {
    return {
      allowed: false,
      blockedBy: 'email',
      remaining: 0,
      resetTime: emailResult.resetTime,
    };
  }

  if (!ipResult.allowed) {
    return {
      allowed: false,
      blockedBy: 'ip',
      remaining: 0,
      resetTime: ipResult.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: Math.min(emailResult.remaining, ipResult.remaining),
    resetTime: Math.max(emailResult.resetTime, ipResult.resetTime),
  };
}

/**
 * Increment rate limit counters after a failed verification attempt
 */
export function incrementVerificationRateLimit(email: string, ip: string): void {
  const emailKey = `verify:${email}`;
  const ipKey = `verify:${ip}`;

  // Use checkRateLimit with increment behavior (it already increments)
  const now = Date.now();

  // Manually increment the counters without checking
  const emailEntry = rateLimitMap.get(emailKey);
  if (emailEntry && now <= emailEntry.resetTime) {
    emailEntry.count++;
  }

  const ipEntry = rateLimitMap.get(ipKey);
  if (ipEntry && now <= ipEntry.resetTime) {
    ipEntry.count++;
  }
}

export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

/**
 * Reset verification rate limits for an email and IP
 */
export function resetVerificationRateLimit(email: string, ip: string): void {
  resetRateLimit(`verify:${email}`);
  resetRateLimit(`verify:${ip}`);
}
