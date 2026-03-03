## Context

项目当前已有完整的收藏功能后端实现：
- API 端点：`POST /api/items/[id]/favorite`（切换收藏状态）
- API 端点：`GET /api/items?isFavorite=true`（获取收藏文章）
- 组件：`FavoriteButton`（收藏按钮，支持切换状态）
- 组件：`ItemList`（文章列表组件，支持 `filterFavorite` 参数）

导航配置 `lib/config/navigation.ts` 中已定义收藏项，但标记为 `disabled: true`，表示该功能尚未完成。

现有 `ItemList` 组件已支持通过 `filterFavorite` 参数筛选收藏文章，复用该组件可避免重复代码。

## Goals / Non-Goals

**Goals:**
- 创建独立的 `/favorites` 页面，提供良好的收藏浏览体验
- 实时更新导航栏中的收藏数量
- 支持按订阅源筛选和按发布时间排序
- 为收藏查询添加数据库索引以优化性能

**Non-Goals:**
- 不实现收藏页面的"全部标记为已读"功能
- 不在收藏页面提供额外的已读/未读筛选器
- 不修改现有 API 端点
- 不实现收藏分组功能（使用下拉筛选）

## Decisions

### 决策 1：导航数量更新使用 React Context

**选择方案：** 使用 React Context 管理收藏数量状态

**理由：**
- 现有架构没有使用 React Query 或 SWR，引入新依赖增加复杂度
- 服务器组件方案（每次导航刷新时查询）用户体验较差，需要手动刷新才能看到数量变化
- Context 方案在用户收藏/取消收藏时可实时更新导航数量，提供更好的交互反馈
- 实现简单，只需创建 `FavoriteContext` 提供数量和更新方法

**替代方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| 服务器组件 | 简单，无需状态管理 | 不实时，需要刷新导航 |
| React Query | 性能好，自动同步 | 需要引入新依赖 |
| **Context** | 实时更新，实现简单 | 需要手动管理同步 |

### 决策 2：收藏页面复用 ItemList 组件

**选择方案：** 创建新页面组件，传入 `filterFavorite={true}` 给 ItemList

**理由：**
- `ItemList` 已支持 `filterFavorite` 参数，完全满足需求
- 避免重复代码，保持组件单一职责
- 复用现有的排序、筛选、空状态逻辑

**实现方式：**
```tsx
// app/(dashboard)/favorites/page.tsx
export default function FavoritesPage() {
  return (
    <div>
      <h1>收藏</h1>
      <ItemList filterFavorite={true} />
    </div>
  );
}
```

### 决策 3：收藏数量通过 API 端点获取

**选择方案：** 创建 `/api/favorites/count` 端点返回收藏数量

**理由：**
- 明确的端点语义，便于缓存和优化
- 避免查询所有文章只为了计数（`/api/items?isFavorite=true` 可能返回大量数据）
- 未来可扩展支持其他统计端点

**替代方案：** 复用 `/api/items?isFavorite=true` 后获取数组长度
- 缺点：当收藏文章很多时，传输大量不必要的数据

### 决策 4：页面使用 Client Component

**选择方案：** 收藏页面使用 Client Component

**理由：**
- 需要交互功能（排序切换、筛选切换、收藏数量更新）
- 需要与 Context 交互以更新导航数量
- 现有的 `ItemList` 已是 Client Component，保持一致性

**数据获取：** 在组件挂载时通过 `fetchItems({ isFavorite: true })` 获取数据

### 决策 5：为 isFavorite 添加数据库索引

**选择方案：** 创建迁移为 `feed_items.is_favorite` 添加索引

**理由：**
- 按收藏状态筛选是常见查询模式（`WHERE is_favorite = true`）
- 随着用户收藏文章增多，索引能显著提升查询性能
- SQLite 的 B-tree 索引开销相对较小，值得投资

**迁移 SQL：**
```sql
CREATE INDEX IF NOT EXISTS feed_items_is_favorite_idx ON feed_items(is_favorite);
```

## 组件与文件结构

```
新增文件：
├── app/(dashboard)/favorites/
│   └── page.tsx                  # 收藏页面组件
├── lib/context/
│   └── FavoriteContext.tsx       # 收藏数量 Context
├── app/api/favorites/count/
│   └── route.ts                 # 收藏数量 API 端点
└── __tests__/
    ├── app/(dashboard)/favorites/
    │   └── page.test.tsx        # 收藏页面测试
    ├── lib/context/
    │   └── FavoriteContext.test.tsx
    └── app/api/favorites/count/
        └── route.test.ts        # API 端点测试

修改文件：
├── lib/config/navigation.ts       # 启用收藏项，添加数量显示逻辑
├── lib/db/schema.ts               # 添加 isFavorite 索引定义（通过迁移）
└── components/items/FavoriteButton.tsx  # 调用 Context 更新数量

数据库迁移：
└── lib/db/migrations/
    └── [timestamp]_add_is_favorite_idx.sql
```

## 数据流图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         数据流                                     │
└─────────────────────────────────────────────────────────────────────┘

用户操作                         状态更新                       UI 渲染
    │                              │                             │
    ├─ 收藏/取消收藏 ──────────────► 更新 isFavorite               │
    │                              │ ──► 调用 FavoriteContext      │
    │                              │        .updateCount()         │
    │                              │                             │
    │                              │                        导航栏数量更新
    │                              │                             │
    ├─ 切换排序/筛选 ─────────────► 重新获取文章列表                │
    │                              │                             │
    │                              │                        文章列表重新渲染
    │                              │                             │

API 调用：
├─ POST /api/items/[id]/favorite  （切换收藏）
├─ GET  /api/items?isFavorite=true （获取收藏文章）
└─ GET  /api/favorites/count       （获取收藏数量）
```

## Risks / Trade-offs

**风险 1：Context 与服务器数据不同步**
- 风险：用户在多个标签页操作时，Context 状态可能不一致
- 缓解：在组件挂载时重新获取收藏数量，确保初始值正确

**风险 2：收藏页面数据量大导致性能问题**
- 风险：用户收藏文章很多时，列表加载和渲染变慢
- 缓解：后续可考虑添加分页或虚拟滚动（当前版本不实现）

**风险 3：数据库迁移在生产环境失败**
- 风险：添加索引时可能因数据量大导致超时
- 缓解：SQLite 索引创建速度较快，迁移脚本包含 `IF NOT EXISTS` 保护

**Trade-off 1：实时性 vs 复杂度**
- 选择：Context 方案提供实时更新，增加少量状态管理复杂度
- 放弃：服务器组件方案更简单，但用户体验较差

**Trade-off 2：功能完整性 vs 开发速度**
- 选择：实现核心功能（查看收藏、筛选、排序），快速交付
- 放弃：高级功能（收藏文件夹、批量操作等）后续再实现

## Migration Plan

### 部署步骤

1. **创建数据库迁移**
   ```bash
   pnpm exec drizzle-kit generate
   ```

2. **应用迁移**
   ```bash
   pnpm exec drizzle-kit migrate
   ```

3. **代码部署顺序**
   - 部署后端代码（API 端点、Context）
   - 部署前端代码（页面组件、导航更新）
   - 验证功能正常

### 回滚策略

- 数据库迁移使用 Drizzle，支持回滚
- 如遇到严重问题，可以回退到之前的迁移版本
- 前端代码变更通过版本控制可随时回退

## Open Questions

1. **收藏数量精度**：是否显示 99+ 当数量超过 99？
   - 建议：暂不限制，显示实际数量

2. **未读收藏的高亮**：未读的收藏文章是否需要特殊样式？
   - 建议：使用现有的未读标记（绿色圆点），保持一致性
