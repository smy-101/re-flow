/**
 * Test utilities and helper functions
 *
 * This module exports all test utility functions for easy importing.
 * Organized by category:
 * - Data factories: Create mock data with default values
 * - Mock helpers: Mock Next.js and browser APIs
 * - Test utilities: Common test patterns and utilities
 */

// Data factories
export {
  createMockFeed,
  createMockNewFeed,
  createMockItem,
  createMockNewItem,
  createMockUser,
  createMockNewUser,
  createMockFeeds,
  createMockItems,
} from './factory';

// Mock helpers
export {
  createMockRequest,
  createMockCookieStore,
  createAuthenticatedRequest,
  mockJWT,
  mockDate,
  mockFetchSuccess,
  mockFetchError,
  resetFetchMocks,
  createMockQueryResult,
  createMockInsertResult,
} from './mocks';

// Re-export commonly used types for convenience
export type { Feed, NewFeed, FeedItem, NewFeedItem, User, NewUser } from '@/lib/db/schema';
