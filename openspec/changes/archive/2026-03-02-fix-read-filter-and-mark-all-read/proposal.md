## Why

在 `/feeds/[feedId]` 页面点击"已读"过滤器后，系统仍然显示未读文章，导致用户无法查看仅已读的文章。这是由于 `ItemList` 组件的 `filterUnread` 布尔属性无法表达"仅显示已读"状态导致的实现缺陷。

同时，用户需要一种快速批量标记所有未读文章为已读的方式，以避免逐篇操作的繁琐流程。

## What Changes

- **BREAKING**: 修改 `ItemList` 组件的 Props 接口
  - 移除: `filterUnread?: boolean`
  - 新增: `filterStatus?: 'all' | 'unread' | 'read'`
  - 新增: `showMarkAllRead?: boolean` (控制"全部标记为已读"按钮显示)

- 新增"全部标记为已读"功能
  - 新增确认对话框组件 `MarkAllReadConfirm`
  - 新增 API 端点 `POST /api/items/mark-all-read` (标记所有未读)
  - 新增 API 端点 `POST /api/feeds/[feedId]/mark-all-read` (标记特定订阅未读)
  - 在未读过滤器视图下显示"全部标记为已读"按钮

- 更新空状态消息
  - 新增"暂无已读文章"状态和描述
  - 优化空状态文本以匹配新的过滤选项

## Capabilities

### New Capabilities
- `mark-all-read`: 批量标记未读文章为已读的功能，支持全局和特定订阅两种范围

### Modified Capabilities
- `rss-item-reading`: 修复已读过滤器功能，支持完整的阅读状态筛选（全部/未读/已读）

## Non-Goals

- 不实现全局"标记所有订阅的所有文章为已读"功能
- 不实现可撤销的标记操作
- 不添加 Toast 通知系统（可在后续增强中添加）

## Impact

**影响的组件:**
- `components/items/ItemList.tsx` - 核心变更
- `components/items/MarkAllReadConfirm.tsx` - 新增

**影响的页面:**
- `app/(dashboard)/items/page.tsx` - Props 更新
- `app/(dashboard)/items/unread/page.tsx` - Props 更新 + 新增按钮
- `app/(dashboard)/feeds/[feedId]/page.tsx` - Props 更新 + 新增按钮

**影响的 API:**
- 新增 `app/api/items/mark-all-read/route.ts`
- 新增 `app/api/feeds/[feedId]/mark-all-read/route.ts`
- 更新 `lib/api/items.ts` - 新增客户端函数

**依赖:**
- 无新增外部依赖
- 复用现有 `Modal` 和 `Button` 组件

**向后兼容性:**
- `ItemList` 组件接口变更属于 BREAKING change
- 所有使用 `ItemList` 的页面需要同步更新 props
