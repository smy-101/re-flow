## Context

**Current State:**
- Feed detail page at `app/(dashboard)/feeds/[feedId]/page.tsx` imports from `@/lib/mock-data`
- Mock data uses string IDs (`"feed-1"`, `"feed-2"`) while database uses numeric IDs (`1`, `2`)
- Backend APIs (`/api/feeds/[id]`, `/api/items`) are fully implemented and operational
- Other components (`FeedList`, `ItemList`) already use real APIs successfully

**Constraints:**
- Client component (`'use client'` directive) — must use client-side data fetching
- No server component migration in scope
- Page structure and UI remain unchanged

## Goals / Non-Goals

**Goals:**
- Replace mock-data import with real API client import
- Enable feed detail page to display actual database content
- Complete migration from mock data to production APIs

**Non-Goals:**
- No UI/UX changes
- No new features
- No server component conversion
- No API endpoint modifications

## Decisions

### Import Source Change
**Decision:** Replace `import { fetchFeedById, Feed } from '@/lib/mock-data'` with `import { fetchFeedById, Feed } from '@/lib/api/feeds'`

**Rationale:**
- Aligns with existing pattern in `FeedList` and `ItemList` components
- Leverages already-tested API client layer
- No code duplication

**Alternatives Considered:**
- Modify mock-data to generate numeric IDs — **Rejected**: Defeats purpose of migration
- Delete mock-data entirely — **Rejected**: Other pages may still use it
- Server component refetch — **Rejected**: Out of scope, larger change

### Type Compatibility
**Decision:** Use existing `Feed` type from `@/lib/api/feeds`

**Rationale:**
- Type already extends schema with `unreadCount` field
- Page already uses `feed.unreadCount` — no type changes needed
- Schema uses `number` for IDs, API accepts `string | number` for flexibility

## Risks / Trade-offs

**Risk:** Mock-data file becomes orphaned
- **Mitigation:** Audit other components for mock-data usage before deletion

**Risk:** Page may have unseen dependencies on mock-data behavior
- **Mitigation:** Test with existing database records; error handling already in place

**Trade-off:** Client-side fetching vs. server components
- Current architecture uses client-side data fetching pattern
- Keeping it maintains consistency with other pages

## Migration Plan

1. Change import statement in `app/(dashboard)/feeds/[feedId]/page.tsx`
2. Verify no other imports from `@/lib/mock-data` in the file
3. Test by accessing `/feeds/1` (or any existing feed ID)
4. Check browser console for type errors or API failures
5. Verify feed details and item list display correctly

**Rollback:** Single-line revert if issues arise

## Open Questions

None — straightforward import replacement with clear precedent in codebase.

---

## Additional Findings (Post-Implementation)

During cleanup audit, discovered another page still using mock-data:
- `app/(dashboard)/items/[itemId]/page.tsx` — Item detail page

This page should be migrated in a future change following the same pattern used here.
