## Why

The feed detail page at `/feeds/[feedId]` displays "订阅不存在" (Feed not found) when accessing valid feeds like `/feeds/1`. The page incorrectly imports from `@/lib/mock-data` instead of `@/lib/api/feeds`, causing it to query mock data with string IDs ("feed-1") instead of the real database with numeric IDs (1). Other components (FeedList, ItemList) have already migrated to the real API successfully.

## What Changes

- Change import in `app/(dashboard)/feeds/[feedId]/page.tsx` from `@/lib/mock-data` to `@/lib/api/feeds`
- Remove unused mock-data dependency from the page component
- Verify the page correctly displays feed details and associated items

## Capabilities

### New Capabilities
None — this is a bug fix to complete an incomplete migration.

### Modified Capabilities
None — the `feed-management` and `feed-items` capabilities are already specified via their API implementations. This fix aligns the frontend with existing backend behavior.

## Impact

**Affected Code:**
- `app/(dashboard)/feeds/[feedId]/page.tsx` — single import change

**Dependencies:**
- No new dependencies
- Real API endpoints (`/api/feeds/[id]`, `/api/items`) are already implemented and tested

**User Impact:**
- Users will be able to view feed details pages correctly
- No breaking changes — this fixes broken functionality
