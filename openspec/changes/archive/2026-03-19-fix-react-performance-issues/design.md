## Context

re-flow 项目基于审查发现存在多个性能问题类别：

1. **API 瀑布流**：25+ API 路由中 `getAuthenticatedUser()` 和 `request.json()` 串行执行
2. **独立查询串行**：13 处独立数据库查询未使用 `Promise.all()`
3. **Bundle 体积**：54+ 文件直接导入组件，模态框未动态加载
4. **组件重渲染**：ItemCard、FeedCard 等列表组件未 memo 化
5. **数据获取**：无 SWR，每次组件挂载都发起新请求

## Goals / Non-Goals

**Goals:**
- API 路由响应时间减少 30-50%
- 首屏加载时间减少 15-25%
- 列表滚动流畅度提升
- 请求自动去重和缓存

**Non-Goals:**
- 不引入虚拟滚动库
- 不改造为 Server Components
- 不修改数据库 schema
- 不改变 API 契约

## Decisions

### D1: API 路由并行化模式

**决策**：使用 `Promise.all()` 并行化独立操作

```typescript
// Before
const userId = await getAuthenticatedUser();
const body = await request.json();

// After
const [userId, body] = await Promise.all([
  getAuthenticatedUser(),
  request.json()
]);
```

**备选方案**：
- 使用 `Promise.allSettled()` - 拒绝，因为认证失败应立即返回
- 保持串行 - 拒绝，性能损失明显

### D2: 引入 SWR 进行数据获取

**决策**：安装 SWR 并封装为 `useSWR` hooks

**实现方式**：
1. 创建 `lib/hooks/useFeeds.ts`、`useItems.ts` 等 hooks
2. 使用 `SWRConfig` 配置全局 revalidation 策略
3. 使用 `useSWRMutation` 处理 mutations

**备选方案**：
- React Query - 拒绝，SWR 更轻量且足够
- TanStack Query - 拒绝，复杂度不必要

### D3: 组件 Memo 化策略

**决策**：为列表项组件添加 `React.memo`

**涉及组件**：
- `ItemCard` - items 列表
- `FeedCard` - feeds 列表
- `AIConfigCard` - AI 配置列表
- `PipelineCard` - 管道列表

**配合修改**：
- 回调函数使用 `useCallback` 包装
- 派生状态在 render 中计算而非 useEffect

### D4: 动态导入策略

**决策**：使用 `next/dynamic` 延迟加载模态框

```typescript
const FeedSettingsModal = dynamic(
  () => import('@/components/feeds/FeedSettingsModal'),
  { ssr: false }
);
```

**涉及组件**：
- `FeedSettingsModal`
- `DeleteFeedConfirm`
- `ProcessingHistory`

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| SWR 引入新依赖 | 仅 ~5KB gzipped，收益远大于成本 |
| React.memo 过度使用 | 仅用于列表项，避免过度优化 |
| Promise.all 错误处理 | 保持原有 try-catch 模式 |
| 动态导入导致闪烁 | 模态框本身有动画，用户体验不受影响 |

## Migration Plan

1. **Phase 1**: API 路由并行化（无 breaking changes）
2. **Phase 2**: 安装 SWR，逐步替换直接 fetch
3. **Phase 3**: 组件 memo 化
4. **Phase 4**: 动态导入优化

每个阶段独立可测试，可分批提交。

## Open Questions

- [ ] SWR revalidation 间隔应设置为多少？（建议 30s）
- [ ] 是否需要保留 `lib/api/` 中的直接 fetch 函数？（建议保留作为 SWR fetcher）
