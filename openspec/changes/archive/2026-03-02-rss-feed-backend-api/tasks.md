## 1. Setup & Dependencies

- [x] 1.1 Install rss-parser package (`pnpm add rss-parser`)
- [x] 1.2 Add feeds and feed_items tables to lib/db/schema.ts

## 2. Database Migration

- [x] 2.1 Generate Drizzle migration (`pnpm exec drizzle-kit generate`)
- [x] 2.2 Apply database migration (`pnpm exec drizzle-kit migrate`)

## 3. API Client Layer

- [x] 3.1 Create lib/api/feeds.ts with fetchFeeds, fetchFeedById, createFeed, updateFeed, deleteFeed functions
- [x] 3.2 Create lib/api/items.ts with fetchItems, fetchItemById, markAsRead, toggleFavorite functions
- [x] 3.3 Create lib/api/validate.ts with validateFeedUrl function
- [x] 3.4 Create lib/api/categories.ts with getCategories function

## 4. API Routes - Feeds

- [x] 4.1 Create app/api/feeds/route.ts (GET list, POST create)
- [x] 4.2 Create app/api/feeds/[id]/route.ts (GET single, PUT update, DELETE delete)
- [x] 4.3 Create app/api/feeds/validate/route.ts (POST validate RSS URL)

## 5. API Routes - Items & Categories

- [x] 5.1 Create app/api/items/route.ts (GET with filters)
- [x] 5.2 Create app/api/items/[id]/route.ts (GET single item)
- [x] 5.3 Create app/api/items/[id]/read/route.ts (PATCH read status)
- [x] 5.4 Create app/api/items/[id]/favorite/route.ts (POST toggle favorite)
- [x] 5.5 Create app/api/categories/route.ts (GET categories list)

## 6. Component Updates - Feeds

- [x] 6.1 Update components/feeds/FeedList.tsx to use lib/api/feeds instead of mock-data
- [x] 6.2 Update components/feeds/AddFeedForm.tsx to use lib/api/feeds and lib/api/validate
- [x] 6.3 Update components/feeds/FeedSettingsModal.tsx to use lib/api/feeds
- [x] 6.4 Update components/feeds/DeleteFeedConfirm.tsx to use lib/api/feeds
- [x] 6.5 Update components/feeds/FeedCard.tsx to use lib/api/feeds if needed

## 7. Component Updates - Items

- [x] 7.1 Update components/items/ItemList.tsx to use lib/api/items
- [x] 7.2 Update components/items/ReadToggleButton.tsx to use lib/api/items
- [x] 7.3 Update components/items/FavoriteButton.tsx to use lib/api/items
- [x] 7.4 Update components/items/ItemCard.tsx to use lib/api/items if needed

## 8. Unit Tests - API Layer

- [x] 8.1 Write tests for lib/api/feeds.ts functions in __tests__/lib/api/feeds.test.ts
- [x] 8.2 Write tests for lib/api/items.ts functions in __tests__/lib/api/items.test.ts
- [x] 8.3 Write tests for lib/api/validate.ts in __tests__/lib/api/validate.test.ts

## 9. Unit Tests - API Routes

- [x] 9.1 Write tests for app/api/feeds/route.ts in __tests__/app/api/feeds/route.test.ts
- [x] 9.2 Write tests for app/api/items/route.ts in __tests__/app/api/items/route.test.ts

## 10. Integration & Validation

- [x] 10.1 Run pnpm lint and confirm no errors (no new warnings)
- [x] 10.2 Run pnpm test and confirm all tests pass (no failures/no errors)
- [x] 10.3 Run pnpm exec tsc --noEmit confirm zero type errors
