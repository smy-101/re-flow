## 1. 基础设施 - SWR 依赖与配置

- [x] 1.1 安装 SWR 依赖：`pnpm add swr`
- [x] 1.2 创建 `lib/hooks/swr/config.ts` 配置 SWR 全局参数
- [x] 1.3 在 `app/(dashboard)/layout.tsx` 添加 `SWRConfig` provider

## 2. SWR Hooks 实现

- [x] 2.1 创建 `lib/hooks/swr/use-feeds.ts` 实现 `useFeeds` 和 `useFeed` hooks
- [x] 2.2 创建 `lib/hooks/swr/use-items.ts` 实现 `useItems` 和 `useItem` hooks
- [x] 2.3 创建 `lib/hooks/swr/use-categories.ts` 实现 `useCategories` hook
- [x] 2.4 创建 `lib/hooks/swr/use-mutations.ts` 实现通用 mutation hooks
- [x] 2.5 创建 `lib/hooks/swr/index.ts` 统一导出

## 3. 组件 Memo 化

- [x] 3.1 重构 `components/items/ItemCard.tsx` 使用 `React.memo` 包装
- [x] 3.2 重构 `components/feeds/FeedCard.tsx` 使用 `React.memo` 包装
- [x] 3.3 重构 `components/ai/AIConfigCard.tsx` 使用 `React.memo` 包装
- [x] 3.4 重构 `components/pipeline/PipelineCard.tsx` 使用 `React.memo` 包装
- [x] 3.5 在 `components/items/ItemList.tsx` 使用 `useCallback` 稳定回调函数
- [x] 3.6 在 `components/feeds/FeedList.tsx` 使用 `useCallback` 稳定回调函数

## 4. 派生状态优化

- [x] 4.1 重构 `components/feeds/FeedSettingsModal.tsx` 移除 useEffect 同步，改为 render 中派生
- [x] 4.2 检查 `components/craft/CraftTemplateForm.tsx` useState 懒初始化
- [x] 4.3 检查 `components/ai/AIConfigForm.tsx` useState 懒初始化

## 5. API 路由并行化 - feeds

- [x] 5.1 并行化 `app/api/feeds/route.ts` GET 请求中的 auth 和 URL 解析
- [x] 5.2 并行化 `app/api/feeds/route.ts` POST 请求中的 auth 和 JSON 解析
- [x] 5.3 并行化 `app/api/feeds/[id]/route.ts` GET/PUT/DELETE 请求
- [x] 5.4 并行化 `app/api/feeds/[id]/refresh/route.ts` auth 和 params 解析
- [x] 5.5 并行化 `app/api/feeds/[id]/mark-all-read/route.ts` feed 验证和未读查询

## 6. API 路由并行化 - items

- [x] 6.1 并行化 `app/api/items/route.ts` auth 和 URL 解析
- [x] 6.2 并行化 `app/api/items/[id]/route.ts` auth 和 params 解析
- [x] 6.3 并行化 `app/api/items/[id]/read/route.ts` auth 和 params 解析
- [x] 6.4 并行化 `app/api/items/[id]/favorite/route.ts` auth 和 params 解析
- [x] 6.5 并行化 `app/api/items/mark-all-read/route.ts` feeds 和未读查询（已是最优）

## 7. API 路由并行化 - ai-configs & craft-templates

- [x] 7.1 并行化 `app/api/ai-configs/route.ts` GET/POST 请求
- [x] 7.2 并行化 `app/api/ai-configs/[id]/route.ts` GET/PUT/DELETE 请求
- [x] 7.3 并行化 `app/api/ai-configs/[id]/test/route.ts` auth 和 params 解析
- [x] 7.4 并行化 `app/api/craft-templates/route.ts` GET/POST 请求
- [x] 7.5 并行化 `app/api/craft-templates/[id]/route.ts` GET/PUT/DELETE 请求

## 8. API 路由并行化 - pipelines & process

- [x] 8.1 并行化 `app/api/pipelines/route.ts` GET/POST 请求
- [x] 8.2 并行化 `app/api/pipelines/[id]/route.ts` GET/PUT/DELETE 请求
- [x] 8.3 并行化 `app/api/process/route.ts` feed 和 item 查询
- [x] 8.4 并行化 `app/api/process/route.ts` template 和 AI config 查询

## 9. 动态导入优化

- [x] 9.1 重构 `app/(dashboard)/feeds/page.tsx` 动态导入 FeedSettingsModal 和 DeleteFeedConfirm
- [x] 9.2 重构 `app/(dashboard)/items/[itemId]/page.tsx` 动态导入 ProcessingHistory
- [x] 9.3 重构 `app/(dashboard)/settings/ai/page.tsx` 动态导入 AIConfigModal

## 10. 条件渲染修复

- [x] 10.1 修复 `components/feeds/FeedAutoProcessSettings.tsx` 条件渲染使用三元运算符
- [x] 10.2 修复 `components/feeds/AddFeedForm.tsx` 条件渲染
- [x] 10.3 修复 `components/feeds/FeedPreview.tsx` 条件渲染
- [x] 10.4 修复 `components/items/ItemContent.tsx` 条件渲染

## 11. 迁移组件使用 SWR Hooks

- [x] 11.1 迁移 `components/feeds/AddFeedForm.tsx` 使用 `useCategories` hook
- [x] 11.2 迁移 `components/items/ItemList.tsx` 使用 `useItems` 和 `useFeeds` hooks
- [x] 11.3 迁移 `app/(dashboard)/feeds/page.tsx` 使用 `useFeeds` hook
- [x] 11.4 迁移 `app/(dashboard)/favorites/page.tsx` 使用 SWR hooks

## 12. 测试与验证

- [x] 12.1 编写 `__tests__/lib/hooks/swr/` 单元测试
- [x] 12.2 运行 `pnpm test __tests__/lib/hooks/` 确认新用例先失败（Red）
- [x] 12.3 运行 `pnpm test __tests__/lib/hooks/` 确认全部通过（Green）
- [x] 12.4 手工验证 Feeds 页面：列表加载、刷新、编辑、删除功能正常
- [x] 12.5 手工验证 Items 页面：列表加载、过滤、标记已读功能正常
- [x] 12.6 手工验证 Settings AI 页面：配置列表、创建、编辑、测试功能正常

## 13. 代码质量检查

- [x] 13.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 13.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
