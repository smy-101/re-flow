## Why

收藏功能的基础 API 和组件（FavoriteButton、toggleFavorite API）已实现，但导航中的"收藏"项目前被禁用，用户无法在一个专用页面集中查看收藏的文章。需要一个专门的收藏页面来提升用户体验，让用户能够方便地浏览和管理收藏的文章。

## What Changes

- 新增 `/favorites` 专用页面，显示用户收藏的所有文章
- 启用导航配置中的收藏项（移除 disabled 标记）
- 导航展开时显示收藏数量，折叠时仅显示图标作为入口
- 收藏页面支持按订阅源筛选、按发布时间排序（最新/最早切换）
- 显示文章的已读/未读状态，但不提供额外的已读/未读筛选
- 为 `isFavorite` 字段添加数据库索引以提升查询性能

## Capabilities

### New Capabilities
- `favorites-page`: 收藏页面的 UI 和交互逻辑

### Modified Capabilities
- `rss-item-reading`: 扩展现有收藏功能的需求，增加专用页面的场景（使用 delta spec）

## Impact

- 新增页面文件：`app/(dashboard)/favorites/page.tsx`
- 修改文件：`lib/config/navigation.ts`（启用收藏项、添加数量显示逻辑）
- 可能需要数据库迁移：为 `feed_items` 表的 `is_favorite` 字段添加索引
- 复用现有组件：`ItemList`（支持 filterFavorite 参数）和 `FavoriteButton`
- 不涉及 API 端点的修改（现有 `/api/items?isFavorite=true` 已满足需求）
