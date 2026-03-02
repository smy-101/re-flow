## Context

### 当前状态

`ItemList` 组件使用布尔属性 `filterUnread` 来控制文章过滤：
- `filterUnread={true}` → 仅显示未读文章
- `filterUnread={false}` → 显示所有文章

这导致无法表达"仅显示已读文章"的状态，在 `/feeds/[feedId]` 页面点击"已读"按钮后仍然看到未读文章。

### 约束条件

- TypeScript 严格模式，零类型错误
- 使用 React 19 Client Components（需要状态管理）
- 复用现有 `Modal` 和 `Button` 组件，不引入新的 UI 库
- API 需要用户认证（JWT token）

## Goals / Non-Goals

**Goals:**
- 修复已读过滤器功能，支持完整的阅读状态筛选
- 提供批量标记未读文章为已读的功能
- 保持组件类型安全和 API 一致性

**Non-Goals:**
- 不实现全局"标记所有订阅的所有文章为已读"功能
- 不实现 Toast 通知系统
- 不修改现有的单篇标记已读/未读功能

## Decisions

### 1. 组件接口设计: filterStatus 联合类型

**决策:** 使用 `filterStatus?: 'all' | 'unread' | 'read'` 替代 `filterUnread?: boolean`

**理由:**
- 联合类型提供完整的三个状态，类型安全
- 清晰表达意图，`filterStatus='read'` 比 `filterUnread=false` 更明确
- 支持未来扩展（如 `'archived'` 状态）

**替代方案:**
- `filterRead?: boolean` + `filterUnread?: boolean` → 两个布尔值容易产生冲突状态
- `isRead?: boolean` → 与 API 参数名重复，意图不清晰

### 2. API 端点设计: 两个独立端点

**决策:** 创建两个独立的批量标记端点
- `POST /api/items/mark-all-read` - 标记所有订阅的未读文章
- `POST /api/feeds/[feedId]/mark-all-read` - 标记特定订阅的未读文章

**理由:**
- RESTful 设计，路径清晰表达作用范围
- 避免在 body 中传递可选的 `feedId` 参数
- 独立的权限控制和错误处理

**响应格式:**
```json
{ "success": true, "count": 15 }
```

### 3. 确认对话框设计: 独立组件

**决策:** 创建独立的 `MarkAllReadConfirm` 组件

**理由:**
- 复用现有 `Modal` 和 `Button` 组件，保持 UI 一致性
- 独立组件便于测试和维护
- 支持不同作用范围的文案定制

**组件接口:**
```typescript
interface MarkAllReadConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  scope: 'all' | 'feed';
  feedTitle?: string;
}
```

### 4. 状态刷新策略: 重新获取数据

**决策:** 标记完成后重新调用 `fetchItems()` 刷新列表

**理由:**
- 保持数据一致性（服务器为准）
- 实现简单，避免复杂的乐观更新逻辑
- 自动更新 `unreadCount` 等派生状态

**替代方案:** 乐观更新本地状态 → 更快但可能不一致

### 5. 按钮显示逻辑: 通过 Props 控制

**决策:** 使用 `showMarkAllRead?: boolean` prop 控制按钮显示

**理由:**
- 父组件完全控制按钮显示逻辑
- 支持不同页面的不同需求（未读页面显示，订阅详情页只在未读时显示）
- 组件职责单一，不包含复杂的业务逻辑

### 6. API 参数映射

| filterStatus | API isRead 参数 | 结果 |
|--------------|-----------------|------|
| `'all'` | `undefined` | 所有文章 |
| `'unread'` | `false` | 仅未读 |
| `'read'` | `true` | 仅已读 |

## Architecture

### 组件树变更

```
components/items/
├── ItemList.tsx              (修改: Props 接口)
├── ItemCard.tsx              (不变)
├── MarkAllReadConfirm.tsx    (新增)
└── ItemContent.tsx           (不变)
```

### API 路由变更

```
app/api/
├── items/
│   ├── route.ts                     (不变)
│   ├── [id]/
│   │   ├── route.ts                 (不变)
│   │   ├── read/route.ts            (不变)
│   │   └── favorite/route.ts        (不变)
│   └── mark-all-read/
│       └── route.ts                 (新增)
└── feeds/
    └── [feedId]/
        ├── route.ts                 (不变)
        └── mark-all-read/
            └── route.ts             (新增)
```

### 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户点击"全部标记为已读"                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ItemList                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. 获取当前未读文章数量 (items.length)                   │    │
│  │ 2. 打开 MarkAllReadConfirm                             │    │
│  │    传入: count, scope (feedId ? 'feed' : 'all')          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MarkAllReadConfirm (确认对话框)                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 显示: "共 {count} 篇未读文章将被标记为已读"               │    │
│  │ [确认] [取消]                                            │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
              点击取消            点击确认
                    │                   │
                    │             ┌─────▼─────┐
                    │             │ API 调用  │
                    │             │ feedId ?  │
                    │             │ /feeds/.. │
                    │             │ :/items/..│
                    │             └─────┬─────┘
                    │                   │
                    │             ┌─────▼─────┐
                    │             │ 重新获取  │
                    │             │ fetchItems│
                    │             └───────────┘
                    │
                    ▼
              关闭对话框
```

## Implementation Details

### ItemList Props 变更

```typescript
// 旧接口
interface ItemListProps {
  filterUnread?: boolean;
  filterFavorite?: boolean;
  feedId?: string;
}

// 新接口
interface ItemListProps {
  filterStatus?: 'all' | 'unread' | 'read';
  filterFavorite?: boolean;
  feedId?: string;
  showMarkAllRead?: boolean;
}
```

### API 调用逻辑变更

```typescript
// 旧代码 (ItemList.tsx:39)
isRead: filterUnread ? false : undefined

// 新代码
isRead: filterStatus === 'unread' ? false
     : filterStatus === 'read' ? true
     : undefined
```

### 空状态消息更新

```typescript
// 旧代码 (ItemList.tsx:113)
{filterUnread ? '暂无未读文章' : filterFavorite ? '暂无收藏文章' : '暂无文章'}

// 新代码
{
  filterStatus === 'unread' ? '暂无未读文章' :
  filterStatus === 'read' ? '暂无已读文章' :
  filterFavorite ? '暂无收藏文章' :
  '暂无文章'
}
```

### 页面更新清单

1. **app/(dashboard)/items/page.tsx**
   - `<ItemList />` → `<ItemList filterStatus="all" />`

2. **app/(dashboard)/items/unread/page.tsx**
   - `<ItemList filterUnread />` → `<ItemList filterStatus="unread" showMarkAllRead />`

3. **app/(dashboard)/feeds/[feedId]/page.tsx**
   - `<ItemList feedId={feedId} filterUnread={filter === 'unread'} />`
   - → `<ItemList feedId={feedId} filterStatus={filter} showMarkAllRead={filter === 'unread'} />`

## Risks / Trade-offs

### Risk 1: Breaking Change 影响
**风险:** `ItemList` Props 接口变更影响所有使用该组件的页面
**缓解:** 已识别所有使用位置（3个），将在同一变更中同步更新

### Risk 2: 确认对话框用户体验
**风险:** 每次操作都需要确认，可能影响效率
**缓解:** 对话框清晰显示影响范围，用户可选择取消；这是破坏性操作，确认步骤必要

### Risk 3: 网络延迟感知
**风险:** API 调用期间用户可能感到卡顿
**缓解:** 按钮显示加载状态，禁用重复点击；完成后自动刷新列表

### Risk 4: 并发标记问题
**风险:** 用户在标记过程中又有新文章变为未读
**缓解:** 采用服务器为准策略，刷新后显示最新状态

## Migration Plan

### 部署步骤

1. **后端先部署** - 新增 API 端点
2. **前端后部署** - 组件变更
3. **验证** - 在 `/feeds/1` 和 `/items/unread` 页面测试功能

### 回滚策略

- API 端点为新增，不影响现有功能
- 前端如需回滚，需恢复 `filterUnread` 接口（建议保留新代码，切换 Props）

## Open Questions

**无** - 所有关键决策已确定。
