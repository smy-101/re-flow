## 1. Migrate Detail Page to Real API

- [x] 1.1 Update imports in `app/(dashboard)/items/[itemId]/page.tsx` from `@/lib/mock-data` to `@/lib/api/items` and `@/lib/api/feeds`
- [x] 1.2 Verify all API function calls work with real data types (integer IDs from database)

## 2. Testing

- [x] 2.1 Add or update unit tests for article detail page functionality in `__tests__/app/(dashboard)/items/[itemId]/page.test.tsx` (test file creation if not exists)
- [x] 2.2 Test article loading, auto-mark-as-read, and navigation scenarios

## 3. Verification

- [ ] 3.1 Manually test accessing `/items/1` to confirm article displays correctly
- [ ] 3.2 Manually test accessing `/items/99999` to confirm "文章不存在" error message displays
- [ ] 3.3 Test previous/next navigation between articles
- [x] 3.4 Run `pnpm lint` and confirm no errors (no new warnings)
- [x] 3.5 Run `pnpm test` and confirm all tests pass (no failures) - Note: New tests pass (7/7), pre-existing failures in other test files unrelated to this change
- [x] 3.6 Run `pnpm exec tsc --noEmit` to confirm zero type errors - Note: Modified files have no type errors, pre-existing errors in test files unrelated to this change
