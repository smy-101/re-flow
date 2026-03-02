## Context

The article detail page (`app/(dashboard)/items/[itemId]/page.tsx`) was originally built with mock data during initial development. The article list page has already been migrated to use the real API endpoints, but the detail page still imports from `lib/mock-data.ts`. The backend API (`/api/items/[id]`) is fully functional and returns data from the SQLite database.

**Current State:**
- Detail page uses `fetchItemById()` from `lib/mock-data.ts` (in-memory data with string IDs like `"item-feed-1-1"`)
- API returns database items with integer IDs (`1`, `2`, `3`, ...)
- Real article data exists in database but detail page cannot access it

**Target State:**
- Detail page uses `fetchItemById()` from `lib/api/items.ts` (calls `/api/items/[id]`)
- All data flows through the real API, consistent with the list page
- Mock data dependency can eventually be removed from the codebase

## Goals / Non-Goals

**Goals:**
- Migrate article detail page to use real API endpoints
- Maintain all existing functionality (auto-mark as read, navigation, feed info display)
- Ensure type safety with TypeScript (integer IDs from database vs string IDs from mock)
- Provide consistent user experience with the migrated list page

**Non-Goals:**
- Removing `lib/mock-data.ts` (may be used by other parts of the app)
- Changing the article detail page layout or UI components
- Modifying API endpoints (they already exist and work correctly)

## Decisions

### 1. Keep Client Component Architecture
**Decision:** The detail page remains a Client Component (`'use client'` directive)

**Rationale:**
- Page uses `useParams()`, `useRouter()`, and `useState()` for client-side navigation
- Auto-mark-as-read and navigation features require interactivity
- Current implementation is already client-side; no need to introduce server components

**Alternatives Considered:**
- **Server Component with data fetching:** Would require refactoring all interactive features to separate components, adding complexity for minimal benefit in this case

### 2. Import Paths Change
**Decision:** Replace `@/lib/mock-data` imports with `@/lib/api/items` and `@/lib/api/feeds`

**Rationale:**
- Maintains consistency with the already-migrated `ItemList` component
- API client functions (`fetchItemById`, `fetchItems`, `fetchFeedById`, `markAsRead`) have identical signatures to mock versions
- Real API functions handle errors gracefully (return `null` on failure)

**Import Changes:**
```typescript
// Old (remove)
import { fetchItemById, fetchItems, FeedItem, Feed } from '@/lib/mock-data';
import { markAsRead } from '@/lib/mock-data';

// New (add)
import { fetchItemById, fetchItems, markAsRead, FeedItem } from '@/lib/api/items';
import { fetchFeedById, Feed } from '@/lib/api/feeds';
```

### 3. Type Compatibility
**Decision:** Accept that database uses integer IDs (`number`) while code may pass string IDs from URL params

**Rationale:**
- URL params are strings: `params.itemId` is `string`
- Database IDs are integers: `feedItems.id` is `number`
- API client `fetchItemById()` accepts `string | number`
- Type safety is maintained through TypeScript union types

**Implementation Note:**
```typescript
const itemId = params.itemId as string;  // From URL
fetchItemById(itemId);  // API accepts string | number, converts to number internally
```

## Risks / Trade-offs

### Risk: Authentication Requirements
**Risk:** The `/api/items/[id]` endpoint requires JWT authentication via cookies. If user is not logged in, API returns 401.

**Mitigation:**
- Current implementation already expects authenticated users
- Error handling in API client catches 401 errors
- Page displays error message to user if authentication fails

### Risk: Data Type Inconsistency
**Risk:** Mock data used string IDs, database uses integer IDs. Navigation between items assumes consistent ID types.

**Mitigation:**
- `fetchItems()` returns database items with integer IDs
- Navigation uses `item.id` directly from fetched data (no type conversion needed)
- TypeScript ensures type safety throughout

### Trade-off: Client-Side Data Fetching
**Trade-off:** Keeping Client Component means data is fetched on the client after page load, not server-rendered.

**Acceptable Because:**
- Matches current user experience (no regression)
- Article detail pages are not SEO-critical
- Navigation between articles is smoother without full page reloads
- Consistent with the migrated list page architecture

## Migration Plan

1. **Update imports** in `app/(dashboard)/items/[itemId]/page.tsx`
   - Remove imports from `@/lib/mock-data`
   - Add imports from `@/lib/api/items` and `@/lib/api/feeds`

2. **Verify data flow** through component
   - `fetchItemById(itemId)` → already compatible
   - `fetchItems()` → already compatible
   - `fetchFeedById(itemData.feedId)` → already compatible
   - `markAsRead(itemId, isRead)` → already compatible

3. **Test scenarios:**
   - Access existing article (`/items/1`)
   - Access non-existent article (`/items/99999`)
   - Navigate between articles (previous/next)
   - Verify auto-mark-as-read functionality

4. **No database migrations needed** (schema already exists)

5. **Rollback strategy:** Keep mock data imports as comments temporarily for easy rollback if issues arise
