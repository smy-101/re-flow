## Why

The RSS feed reader UI is fully implemented but uses mock data stored in memory. Users cannot persist feeds, items, or reading state across sessions. We need real backend APIs with database persistence to make the application functional.

## What Changes

- **Database Schema**: Add `feeds` and `feed_items` tables to Drizzle ORM schema
- **API Routes**: Create RESTful Next.js App Router API endpoints for:
  - Feed CRUD operations (list, create, update, delete)
  - Feed item operations (list, mark read/unread, toggle favorite)
  - RSS feed URL validation
  - Category listing
- **Replace Mock Data**: Migrate components from `lib/mock-data.ts` to real API calls
- **Authentication Integration**: Ensure all APIs use existing JWT authentication

## Capabilities

### New Capabilities
- `feed-management`: RSS feed subscription CRUD operations with user scoping
- `feed-item-management`: Feed article listing, reading state, and favorite management
- `rss-validation`: RSS feed URL validation and metadata extraction
- `feed-categories`: Category management for organizing feeds

### Modified Capabilities
- None (no existing backend specs to modify)

## Impact

**Affected Code**:
- `lib/mock-data.ts` — Will be deprecated/replaced with API client functions
- `components/feeds/*.tsx` — Update to use API routes instead of mock functions
- `components/items/*.tsx` — Update to use API routes instead of mock functions
- `lib/db/schema.ts` — Add feeds and feed_items tables

**New Code**:
- `app/api/feeds/*` — Feed management API routes
- `app/api/items/*` — Feed item API routes
- `app/api/feeds/validate/route.ts` — RSS validation endpoint
- `app/api/categories/route.ts` — Category listing endpoint
- `lib/api/` — API client utilities (replacing mock-data.ts)

**Non-goals**:
- RSS feed parsing/fetching logic (will use a library like `rss-parser`)
- Feed refresh scheduling (will be added in a future change)
