## Why

在文章列表页（包括全部文章、未读文章、收藏文章和订阅详情页），点击收藏或已读/未读切换按钮时会意外跳转到文章详情页，而用户期望的是仅触发收藏或状态切换操作，保持在当前页面继续浏览。

## What Changes

- 修改 `FavoriteButton.tsx` 组件，在按钮点击事件中添加 `event.stopPropagation()`，防止触发父级 Link 组件的导航行为
- 修改 `ReadToggleButton.tsx` 组件，在按钮点击事件中添加 `event.stopPropagation()`，防止触发父级 Link 组件的导航行为
- 两个组件的 `onClick` 处理函数需要接收 `React.MouseEvent` 参数并调用 `e.stopPropagation()`

## Capabilities

### New Capabilities
无新增功能。

### Modified Capabilities
无需求规格变更。现有规格 `rss-item-reading` 已定义收藏和已读/未读切换的行为，本次修复仅解决实现层面的交互问题。

## Impact

**受影响的组件：**
- `components/items/FavoriteButton.tsx` - 修改 onClick 事件处理逻辑
- `components/items/ReadToggleButton.tsx` - 修改 onClick 事件处理逻辑

**受影响的页面：**
- `/items` - 全部文章列表页
- `/items/unread` - 未读文章列表页
- `/favorites` - 收藏文章列表页
- `/feeds/[feedId]` - 订阅详情页

**不影响：**
- `components/items/ItemContent.tsx` - 文章详情页使用的组件（按钮不在 Link 内，无需修改）
- 后端 API 端点 - 无需修改
