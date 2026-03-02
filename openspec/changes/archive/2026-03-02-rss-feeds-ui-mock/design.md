## Context

当前项目是一个基于 Next.js 16 + React 19 的多用户应用，已实现基础的用户认证系统（JWT + HTTP-only cookies）。项目使用 App Router 架构，配置了 TypeScript 严格模式和 Tailwind CSS 4。

本次设计专注于 RSS 订阅管理功能的前端实现，使用 mock 数据模拟后端响应，为后续的后端集成奠定基础。

## Goals / Non-Goals

**Goals:**
- 构建完整的 RSS 订阅管理前端界面
- 实现响应式设计，支持桌面和移动端
- 使用 mock 数据提供可交互的原型
- 建立可复用的组件库模式
- 遵循 React 19 和 Next.js 16 最佳实践

**Non-Goals:**
- 后端 API 实现（后续阶段）
- 实际的 RSS feed 解析（使用静态 mock 数据）
- 认证中间件集成（已有认证系统）
- 数据持久化（仅前端状态管理）

## Decisions

### 1. 路由组织 - 使用 Route Groups

**决策：** 使用 Next.js Route Groups `(dashboard)` 来组织受保护页面

**理由：**
- Route Groups 允许共享布局而不影响 URL 路径
- `/feeds` 和 `/items` 路径更简洁，无需 `/dashboard` 前缀
- 便于未来添加公开页面（如首页）和受保护页面的区分

**替代方案：**
- 直接在 `app/` 下创建页面：缺少共享布局，代码重复
- 使用 `/dashboard` 前缀：URL 较长，不符合用户心理模型

### 2. Server vs Client Components

**决策：** 所有交互页面使用 Client Components，布局使用 Server Component

**分类：**
- **Client Components (`'use client'`)**：
  - 所有页面组件（需要 useState、useRouter、事件处理）
  - FeedCard、ItemCard、AddFeedForm 等交互组件
- **Server Components**：
  - DashboardLayout（无状态，仅布局）
  - 静态数据展示（如关于页面）

**理由：**
- 需要处理用户交互（表单提交、路由跳转、状态更新）
- 使用 mock 数据，无需考虑服务器端数据获取的优势
- React 19 的 Client Components 性能已大幅提升

**替代方案：**
- 全部使用 Server Components：无法处理交互逻辑
- 混合使用（数据 Server，交互 Client）：增加复杂度，暂无必要

### 3. 状态管理 - 使用 React Hooks

**决策：** 使用原生 React Hooks (useState, useEffect, useContext) 管理状态

**理由：**
- 应用规模适中，无需引入额外状态管理库
- React Context 足以处理共享状态（如当前用户）
- mock 数据在组件内部管理，简单直接

**未来考虑：**
- 如果状态复杂度增加，可迁移到 Zustand 或 Jotai
- 如果需要服务端状态同步，考虑 React Query

### 4. Mock 数据策略

**决策：** 创建 `lib/mock-data.ts` 集中管理 mock 数据

**实现：**
- 使用 TypeScript 接口定义数据结构
- 提供异步函数模拟 API 调用（返回 Promise）
- 包含延迟模拟网络请求
- 支持基本的 CRUD 操作（内存中状态）

**理由：**
- 集中管理便于后续替换为真实 API
- 模拟异步行为确保前端代码正确处理 loading 状态
- 类型安全确保前后端契约一致

### 5. 组件层次结构

**决策：** 按功能域组织组件

```
components/
├── feeds/           # RSS 订阅相关
├── items/           # RSS 文章相关
├── layout/          # 布局组件
└── ui/              # 通用 UI 组件（Button, Card, Input）
```

**理由：**
- 清晰的领域划分
- 便于团队协作和代码维护
- 通用 UI 组件可复用

**替代方案：**
- 按组件类型分类（`/atoms`, `/molecules`）：过于理论化，实际收益不大
- 单层 components 目录：组件增多后难以管理

### 6. 类型定义

**决策：** 类型定义与 mock 数据放在一起，组件内使用内联类型

**实现：**
- `lib/mock-data.ts` 导出 `Feed`、`FeedItem` 等类型
- 组件 props 使用内联 interface 或 type

**理由：**
- 类型与数据结构紧密相关
- 避免创建独立的 `types/` 目录增加复杂度
- 小型应用中，类型与代码临近更易维护

## Component Tree

```
app/(dashboard)/
├── layout.tsx                    # DashboardLayout (Server Component)
│   └── DashboardNavbar           # 导航栏组件
│       └── UserMenu              # 用户下拉菜单
│
├── feeds/
│   ├── page.tsx                  # FeedListPage (Client)
│   │   └── FeedList              # 列表容器
│   │       └── FeedCard × N      # 订阅卡片
│   │
│   ├── add/page.tsx              # AddFeedPage (Client)
│   │   └── AddFeedForm           # 添加表单
│   │       ├── URLInput
│   │       ├── CategorySelect
│   │       └── FeedPreview
│   │
│   └── [feedId]/page.tsx         # FeedDetailPage (Client)
│       └── ItemList              # 文章列表容器
│           └── ItemCard × N      # 文章卡片
│
└── items/
    ├── page.tsx                  # AllItemsPage (Client)
    ├── unread/page.tsx           # UnreadItemsPage (Client)
    └── [itemId]/page.tsx         # ItemDetailPage (Client)
        └── ItemContent           # 文章内容
```

## Mock Data Structure

```typescript
// lib/mock-data.ts
interface Feed {
  id: string;
  userId: string;          // 多用户隔离
  title: string;
  feedUrl: string;
  siteUrl?: string;
  description?: string;
  category?: string;
  createdAt: number;        // Unix timestamp
  lastUpdatedAt: number;
  unreadCount: number;
}

interface FeedItem {
  id: string;
  feedId: string;
  title: string;
  link: string;
  content: string;
  publishedAt: number;
  isRead: boolean;
  isFavorite: boolean;
  author?: string;
  readingTime?: number;     // 分钟
}
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Mock 数据与真实 API 结构不匹配** | 使用 TypeScript 接口定义明确契约，便于后续调整 |
| **Client Components 首屏加载较慢** | React 19 已优化，后续可考虑混合使用 Server Components |
| **状态管理复杂度随功能增加** | 当前使用 Hooks，需要时引入状态管理库 |
| **移动端体验未充分测试** | 响应式设计，需在各种设备上验证 |
| **无认证拦截，未登录用户可访问** | 本阶段仅前端，后续添加 middleware 拦截 |

## Open Questions

1. **文章内容渲染：** 是否需要支持 markdown 或 HTML 渲染？
   - 暂定：显示纯文本 + 原文链接，避免 XSS 风险

2. **图片处理：** 文章图片如何显示？
   - 暂定：暂不处理图片，后续可添加图片优化

3. **分页策略：** 列表页采用分页还是无限滚动？
   - 暂定：传统分页（更易实现，可后续优化为无限滚动）

4. **搜索功能：** 是否需要搜索订阅或文章？
   - 暂定：UI 预留搜索框，暂不实现搜索逻辑

## Implementation Notes

### Tailwind CSS 4 使用
- 使用 `@import "tailwindcss"` 和 `@theme inline` 语法
- 优先使用 Tailwind utility classes，避免自定义 CSS
- 复用 app/globals.css 中定义的 CSS 变量

### TypeScript 配置
- 严格模式已启用，确保所有类型正确定义
- 使用 `pnpm exec tsc --noEmit` 验证无类型错误
- 避免使用 `any` 和 `@ts-ignore`

### 测试策略
- 组件使用 Vitest + React Testing Library 测试
- 测试文件放在 `__tests__/` 或 `*.test.tsx` 旁置
- 重点测试：用户交互流程、状态更新、边界条件
