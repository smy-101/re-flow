## Why

用户需要一个 RSS 订阅管理功能的前端界面，以便多用户能够管理各自的 RSS feed 订阅。当前项目已有基础的认证系统，但缺少订阅管理的用户界面。

## What Changes

- 新增 RSS 订阅管理的页面和组件
- 创建仪表盘布局，包含导航栏和主内容区域
- 实现以下页面：
  - 订阅列表页（`/feeds`）- 显示用户的所有 RSS 订阅
  - 添加订阅页（`/feeds/add`）- 添加新的 RSS feed
  - 订阅详情页（`/feeds/[feedId]`）- 查看单个订阅的文章列表
  - 文章列表页（`/items`）- 聚合显示所有订阅的文章
  - 未读文章页（`/items/unread`）- 仅显示未读文章
  - 文章详情页（`/items/[itemId]`）- 阅读单篇文章内容
- 创建可复用的 UI 组件（FeedCard、ItemCard、AddFeedForm 等）
- 使用 mock 数据模拟后端 API 响应

## Capabilities

### New Capabilities
- `rss-feed-management`: RSS 订阅的增删改查管理能力
- `rss-item-reading`: RSS 文章的阅读和状态管理能力
- `dashboard-layout`: 仪表盘共享布局和导航

### Modified Capabilities
- 无（此为全新功能）

## Impact

**新增文件：**
- `app/(dashboard)/layout.tsx` - 仪表盘共享布局
- `app/(dashboard)/feeds/page.tsx` - 订阅列表页
- `app/(dashboard)/feeds/add/page.tsx` - 添加订阅页
- `app/(dashboard)/feeds/[feedId]/page.tsx` - 订阅详情页
- `app/(dashboard)/items/page.tsx` - 文章列表页
- `app/(dashboard)/items/unread/page.tsx` - 未读文章页
- `app/(dashboard)/items/[itemId]/page.tsx` - 文章详情页
- `components/feeds/*.tsx` - RSS 订阅相关组件
- `components/items/*.tsx` - RSS 文章相关组件
- `components/layout/*.tsx` - 布局组件
- `lib/mock-data.ts` - Mock 数据生成器

**依赖：**
- 无新增外部依赖（使用现有技术栈）
- 后续阶段需要添加 RSS 解析库（本阶段仅前端）

**非目标（Non-goals）：**
- 不涉及后端 API 实现
- 不涉及 RSS feed 解析和存储逻辑
- 不涉及认证中间件（使用已有的认证系统）
