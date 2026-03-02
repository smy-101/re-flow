## Why

在实施 `fix-read-filter-and-mark-all-read` 变更时，引入了一个 Next.js 路由冲突错误。新建的 `app/api/feeds/[feedId]/` 目录与现有的 `app/api/feeds/[id]/` 目录在同一层级，导致 Next.js 报错：`You cannot use different slug names for the same dynamic path ('feedId' !== 'id')`。这会使开发服务器崩溃，必须立即修复。

## What Changes

- **BREAKING**: 删除新建的 `app/api/feeds/[feedId]/mark-all-read/route.ts` 端点
- 将 `mark-all-read` 端点移至现有目录 `app/api/feeds/[id]/mark-all-read/route.ts`
- 更新客户端 API 函数 `markAllAsRead()` 的路径生成逻辑
- 保持 API 功能不变，仅调整路由结构

## Capabilities

无需修改规格。这是纯实现错误修复，不涉及功能变更。

## Non-Goals

- 不修改任何 API 功能或行为
- 不更改现有端点 (`[id]/route.ts`, `[id]/refresh/route.ts`)
- 不影响前端组件或其他 API 调用

## Impact

**影响的文件:**
- 删除: `app/api/feeds/[feedId]/mark-all-read/route.ts`
- 新增: `app/api/feeds/[id]/mark-all-read/route.ts`
- 修改: `lib/api/items.ts` (更新 `markAllAsRead()` 路径生成)

**不影响:**
- 前端组件
- API 功能
- 其他端点
- 数据库结构

**严重性:** 高 - 阻塞开发和测试
