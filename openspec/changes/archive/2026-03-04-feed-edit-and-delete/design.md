## Context

当前订阅列表页面（`app/(dashboard)/feeds/page.tsx`）仅为服务端组件，渲染一个静态的 FeedList 组件。后端 API 已完整支持更新（PUT `/api/feeds/[id]`）和删除（DELETE `/api/feeds/[id]`）操作，且相关 UI 组件（`FeedSettingsModal.tsx`、`DeleteFeedConfirm.tsx`）已存在。缺少的是将用户交互连接到这些操作的客户端逻辑和状态管理。

现有 `FeedList.tsx` 组件自身负责数据获取（`fetchFeeds` + `useEffect`），这使得提升状态管理到父组件成为必要，以便在操作完成后刷新订阅列表。

`FeedCard.tsx` 中的设置按钮（⋮）目前有 TODO 注释，未连接任何功能。

## Goals / Non-Goals

**Goals:**
- 实现完整的订阅编辑流程：用户可以修改订阅标题和分类
- 实现完整的订阅删除流程：用户可以删除订阅，带确认弹窗
- 操作完成后自动刷新订阅列表
- 遵循现有代码模式（参照 `ItemList.tsx` 的 Modal 状态管理模式）

**Non-Goals:**
- 不涉及撤销删除功能
- 不修改后端 API 行为
- 不添加新的数据模型或数据库迁移

## Decisions

### 决策 1：状态提升至 FeedsPage 组件

采用 **方案 B**，将所有 Modal 状态提升到 `app/(dashboard)/feeds/page.tsx` 页面组件。

**理由：**
- 遵循 Next.js App Router 的页面作为控制器的模式
- `FeedList` 可简化为纯展示组件，提升可测试性和复用性
- 为未来页面级功能（搜索、筛选、批量操作）预留空间
- 与项目的 `ItemList` 组件模式保持一致

**已考虑的替代方案：**
- 方案 A（状态在 FeedList）：会导致 FeedList 组件臃肿，不符合单一职责原则
- 方案 C（混合状态）：状态分散，难以追踪和调试

### 决策 2：FeedList 改为接受 feeds props

`FeedList` 不再负责数据获取，改为接受 `feeds` 数组作为 props。

**理由：**
- 数据获取逻辑统一在 FeedsPage
- FeedList 成为纯展示组件，更容易测试
- 符合 React 组件分层最佳实践

### 决策 3：单一 Modal 实例

页面级别只维护一个 `FeedSettingsModal` 和一个 `DeleteFeedConfirm` 实例。

**理由：**
- 避免同时打开多个模态框的复杂状态
- 符合用户心智模型（一次操作一个订阅）
- 实现更简单

### 决策 4：操作成功后重新获取订阅列表

完成编辑或删除后，调用 `fetchFeeds()` 重新获取数据。

**理由：**
- 确保显示最新状态
- 处理并发操作场景（其他窗口可能修改数据）
- 实现简单，无需本地状态同步逻辑

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 用户在 `/feeds/[feedId]` 页面时订阅被删除 | 现有错误处理已覆盖（显示"订阅不存在"，提供返回按钮） |
| 网络请求失败时用户体验 | 在 Modal 中显示错误信息，保持 Modal 打开状态允许重试 |
| 用户快速点击多个设置按钮 | 单一 Modal 实例会自动覆盖当前操作的订阅 |
| 重新获取数据时出现竞态条件 | 使用 loading 状态禁用操作按钮，防止重复提交 |

## Risks / Trade-offs

- [实现复杂度] 需要将现有服务端组件改为客户端组件
- [用户体验] 删除操作无法撤销（已明确为非目标）
