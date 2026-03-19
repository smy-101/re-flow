# React/Next.js 性能优化

## Why

项目存在多处性能问题：API 路由中 47 处串行 await 导致瀑布流请求，Bundle 优化缺失增加首屏加载时间，列表组件未 memo 化导致不必要重渲染，缺少 SWR 导致请求无法去重和缓存。这些问题影响用户体验，需要立即修复。

## What Changes

- **API 路由并行化**：将独立的 await 改为 Promise.all() 并行执行
- **Bundle 优化**：动态导入模态框组件，延迟加载第三方库
- **组件 Memo 化**：为 ItemCard、FeedCard、AIConfigCard、PipelineCard 添加 React.memo
- **数据获取优化**：引入 SWR 实现请求去重和缓存
- **条件渲染修复**：将 `&&` 条件渲染改为三元运算符
- **状态管理优化**：使用 useTransition 处理非紧急更新

## Capabilities

### New Capabilities

- `swr-data-fetching`: 使用 SWR 实现客户端数据获取、缓存和去重
- `component-memoization`: 列表组件 memo 化和回调函数稳定化

### Modified Capabilities

- `api-routes`: API 路由并行化改造，修改实现方式但不改变 API 契约
- `bundle-optimization`: 动态导入和延迟加载策略

## Impact

**API 路由** (25+ 文件)：
- `app/api/feeds/`、`app/api/items/`、`app/api/ai-configs/`、`app/api/craft-templates/`、`app/api/pipelines/`、`app/api/process/`

**组件** (20+ 文件)：
- `components/items/ItemList.tsx`、`components/feeds/FeedList.tsx`
- `components/items/ItemCard.tsx`、`components/feeds/FeedCard.tsx`
- `components/ai/AIConfigCard.tsx`、`components/pipeline/PipelineCard.tsx`

**依赖**：
- 新增：`swr` 包

## Non-goals

- 不涉及服务端组件改造（保持现有架构）
- 不引入虚拟滚动库（使用 content-visibility CSS 即可）
- 不修改数据库 schema 或 API 契约
