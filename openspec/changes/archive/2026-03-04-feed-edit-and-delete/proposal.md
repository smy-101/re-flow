## Why

当前无法通过用户界面删除 RSS 订阅或编辑订阅的标题与分类。虽然后端 API 已支持删除和更新操作，且相关 UI 组件（DeleteFeedConfirm、FeedSettingsModal）已存在，但缺少将组件连接到用户操作流程的代码。用户只能添加订阅，无法管理现有订阅。

## What Changes

- 在 `app/(dashboard)/feeds/page.tsx` 中添加订阅管理状态
- 修改 `components/feeds/FeedCard.tsx`，连接设置按钮到打开设置弹窗
- 简化 `components/feeds/FeedList.tsx` 为纯展示组件，接受 feeds 作为 props
- 在订阅列表页渲染 FeedSettingsModal 和 DeleteFeedConfirm 弹窗
- 实现编辑订阅标题和分类的完整流程
- 实现删除订阅的确认与执行流程

## Capabilities

### New Capabilities
无 - 后端 API 能力已存在（参考 openspec/specs/feed-management/spec.md 中的 Update feed settings 和 Delete feed subscription 需求）

### Modified Capabilities
无 - 后端需求未变更，仅补充前端 UX 实现

## Impact

- **前端组件**：`app/(dashboard)/feeds/page.tsx`、`components/feeds/FeedList.tsx`、`components/feeds/FeedCard.tsx`
- **现有组件**：`components/feeds/FeedSettingsModal.tsx`、`components/feeds/DeleteFeedConfirm.tsx`（已存在，仅需连接）
- **API 函数**：`lib/api/feeds.ts` 中的 `updateFeed()` 和 `deleteFeed()`（已存在）
- **页面路径**：`/feeds`（订阅列表页）
