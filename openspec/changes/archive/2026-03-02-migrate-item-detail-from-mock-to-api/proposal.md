## Why

The article detail page at `/items/[itemId]` currently imports from `lib/mock-data.ts` and uses in-memory mock data, while the list page has already been migrated to use the real API. When users access an article like `/items/1`, the page searches mock data (which uses string IDs like `"item-feed-1-1"`) and fails to find the article, showing "文章不存在" (article does not exist). The real article data exists in the SQLite database and is accessible via the existing `/api/items/[id]` endpoint.

## What Changes

- **Update item detail page component** (`app/(dashboard)/items/[itemId]/page.tsx`):
  - Replace imports from `@/lib/mock-data` with `@/lib/api/items` and `@/lib/api/feeds`
  - Use real API functions `fetchItemById()`, `fetchItems()`, `fetchFeedById()`, and `markAsRead()`
  - Handle different ID types (database uses integer IDs, mock used string IDs)

- **Remove mock data dependency**: The page will no longer depend on `lib/mock-data.ts`

## Capabilities

### New Capabilities
- `item-detail-api`: Article detail page fetching and displaying data from real API

### Modified Capabilities
- None (this is purely an implementation migration; the user-facing behavior remains the same)

## Impact

- **Affected Code**: `app/(dashboard)/items/[itemId]/page.tsx`
- **APIs**: Uses existing endpoints `/api/items/[id]` and `/api/items/[id]/read`
- **No Breaking Changes**: This only affects internal implementation; user-visible behavior and URLs remain unchanged
