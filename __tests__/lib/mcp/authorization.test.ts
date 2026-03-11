import { describe, expect, it } from 'vitest';
import {
  assertFeedAccess,
  assertPublishedWithinScope,
  assertRawFallbackAllowed,
  MCPAuthorizationError,
} from '@/lib/mcp/authorization';

describe('lib/mcp/authorization', () => {
  it('rejects feed access outside the token whitelist', () => {
    expect(() => assertFeedAccess([2, 4, 8], 9)).toThrowError(
      expect.objectContaining({
        code: 'feed_forbidden',
      } satisfies Partial<MCPAuthorizationError>),
    );
  });

  it('rejects articles older than the token time window', () => {
    expect(() => assertPublishedWithinScope(1_700_000_000 - (8 * 24 * 60 * 60), {
      timeWindowDays: 7,
      nowUnix: 1_700_000_000,
    })).toThrowError(
      expect.objectContaining({
        code: 'time_window_forbidden',
      } satisfies Partial<MCPAuthorizationError>),
    );
  });

  it('rejects raw fallback when the token disables it', () => {
    expect(() => assertRawFallbackAllowed(false)).toThrowError(
      expect.objectContaining({
        code: 'raw_fallback_forbidden',
      } satisfies Partial<MCPAuthorizationError>),
    );
  });
});
