## Context

### 当前状态

在 `fix-read-filter-and-mark-all-read` 变更中，创建了新的批量标记已读 API 端点：

```
app/api/feeds/[feedId]/mark-all-read/route.ts  ← 新建（错误）
```

但项目中已存在：

```
app/api/feeds/[id]/
├── route.ts           (GET, PUT, DELETE)
└── refresh/route.ts   (POST)
```

### 约束条件

- Next.js App Router 不允许同一层级使用不同的动态参数名
- 服务器无法启动，必须立即修复
- 不能影响现有的 API 功能

## Goals / Non-Goals

**Goals:**
- 修复路由冲突，使服务器能够正常启动
- 保持 `mark-all-read` 端点的功能不变
- 统一 API 路由结构，使用一致的参数命名

**Non-Goals:**
- 不修改端点的功能或响应格式
- 不影响前端组件的调用方式
- 不更改其他现有端点

## Decisions

### 1. 路由结构调整

**决策:** 将 `mark-all-read` 端点移至现有的 `[id]` 目录下

**理由:**
- 与现有端点 (`route.ts`, `refresh/route.ts`) 保持一致
- 避免引入新的动态参数名
- 最小化代码变更

**新结构:**
```
app/api/feeds/[id]/
├── route.ts              (GET, PUT, DELETE) - 现有
├── refresh/route.ts      (POST) - 现有
└── mark-all-read/route.ts (POST) - 移动至此
```

### 2. 客户端 API 路径生成

**当前代码 (错误):**
```typescript
const endpoint = feedId ? `/feeds/${feedId}/mark-all-read` : '/items/mark-all-read';
```

**调整为:**
```typescript
const endpoint = feedId ? `/feeds/${feedId}/mark-all-read` : '/items/mark-all-read';
```

**说明:** 客户端代码无需修改，因为生成的 URL 路径保持不变。

### 3. 参数命名一致性

新端点将使用 `id` 作为参数名（与现有端点一致）:

```typescript
interface RouteContext {
  params: Promise<{ id: string }>;  // 使用 id 而非 feedId
}
```

## Implementation Details

### 文件变更清单

```
删除:
└── app/api/feeds/[feedId]/mark-all-read/route.ts

新增:
└── app/api/feeds/[id]/mark-all-read/route.ts

修改:
└── lib/api/items.ts (markAllAsRead 函数)
    — 将 feedId 参数转换为 id
```

### 迁移步骤

1. 创建新目录 `app/api/feeds/[id]/mark-all-read/`
2. 将 `route.ts` 移动到新目录（修改参数名从 `feedId` 到 `id`）
3. 删除旧的 `app/api/feeds/[feedId]/` 目录
4. 更新 `lib/api/items.ts` 中的 `markAllAsRead()` 函数
5. 验证服务器能够正常启动
6. 运行测试确认功能正常

## Risks / Trade-offs

### Risk 1: 遗留旧的目录
**风险:** `[feedId]` 目录可能未完全删除
**缓解:** 确认删除整个目录树，包括所有子目录

### Risk 2: 参数名混淆
**风险:** 代码中可能混用 `feedId` 和 `id`
**缓解:** 新端点统一使用 `id`，但在内部逻辑中可以重命名为 `feedId` 以保持可读性

### Risk 3: 测试失效
**风险:** API 测试可能因为路径变化而失败
**缓解:** 新端点的 URL 路径实际不变（`/api/feeds/1/mark-all-read`），测试应该继续通过

## Migration Plan

### 部署步骤
1. 创建新的端点文件
2. 删除旧的端点目录
3. 验证服务器启动
4. 运行相关测试

### 回滚策略
如果出现问题：
1. 删除新端点
2. 恢复旧的 `[feedId]` 目录结构
3. 修复前端代码以匹配新的路径结构（不推荐）

**注意:** 由于这是服务器启动阻塞问题，必须在本地环境中验证修复后再提交。

## Open Questions

**无** - 这是一个直接的错误修复，技术路径清晰。
