## Context

当前系统在显示时间戳时存在不一致的问题：
- 数据库中所有时间戳字段（`created_at`、`last_updated_at`、`published_at`）均使用秒级 Unix 时间戳存储
- 后端 API 返回的也是秒级时间戳
- `PipelineCard.tsx` 已正确实现时间戳转换（`createdAt * 1000`）
- 但 `FeedCard.tsx`、`ItemCard.tsx` 和 `CraftTemplateCard.tsx` 直接将秒级时间戳传给 `new Date()`，导致时间被缩小 1000 倍

JavaScript 的 `Date` 构造函数期望毫级时间戳，而 Unix 时间戳传统上是秒级的。这是一个常见的单位不匹配问题。

## Goals / Non-Goals

**Goals:**
- 修复前端所有时间戳显示，统一使用正确的毫级时间戳
- 确保所有组件的时间显示逻辑一致
- 保持数据库和 API 的秒级时间戳存储方式（符合 Unix 标准）

**Non-Goals:**
- 不修改数据库 schema 或 API 响应格式
- 不改变后端的时间戳处理逻辑
- 不重构 `formatDate` 函数的实现逻辑

## Decisions

**决策 1：在前端组件中统一转换时间戳**
- **选择**：在每个组件中将时间戳乘以 1000 后传给 `new Date()`
- **理由**：
  - 改动最小，仅影响前端组件
  - 不影响数据库 schema 或 API 契约
  - 符合 Unix 时间戳的语义（秒级存储，显示时转换）
  - 与 `PipelineCard.tsx` 的现有实现保持一致
- **替代方案**：修改 API 返回毫级时间戳
  - 缺点：需要修改所有 API 路由，影响范围更大
  - 缺点：破坏现有 API 契约，可能影响其他客户端

**决策 2：修复 `formatDate` 函数而不是在每个调用处转换**
- **选择**：在 `formatDate` 函数内部进行转换
- **理由**：
  - 逻辑集中，便于维护
  - 避免重复代码
  - `formatDate` 函数专门用于时间显示，是转换的合适位置

**决策 3：不创建共享的时间戳格式化工具**
- **选择**：保持每个组件的 `formatDate` 函数独立
- **理由**：
  - 当前的 `formatDate` 函数有业务逻辑（"今天"、"昨天"、"N 天前"的显示规则）
  - 这些规则可能因组件而异（如 FeedCard 和 ItemCard 可能需要不同的格式）
  - 避免过早抽象，引入不必要的复杂性

## Risks / Trade-offs

**风险 1：Mock 数据的时间戳格式不一致**
- **描述**：`lib/mock-data.ts` 使用毫级时间戳，与数据库不一致
- **影响**：修复真实数据后，Mock 数据可能显示错误
- **缓解**：在实现时同步更新 `lib/mock-data.ts` 的时间戳格式

**风险 2：可能遗漏其他时间戳显示位置**
- **描述**：可能还有其他组件或页面显示时间戳但未被发现
- **影响**：部分页面的时间显示仍然错误
- **缓解**：通过 grep 搜索 `new Date(` 模式，确保所有位置都被检查

**权衡 1：在前端转换 vs 在 API 层转换**
- **前端转换的优点**：改动小，不影响 API 契约，符合 Unix 标准
- **前端转换的缺点**：每个客户端都需要知道这个转换规则
- **决策**：选择前端转换，因为当前只有 React 客户端，且改动最小

## Migration Plan

1. 修改 `components/feeds/FeedCard.tsx` 的 `formatDate` 函数
2. 修改 `components/items/ItemCard.tsx` 的 `formatDate` 函数
3. 修改 `components/craft/CraftTemplateCard.tsx` 的 `createdAt` 显示
4. 更新 `lib/mock-data.ts` 的时间戳格式（从毫级改为秒级）
5. 验证修复效果（访问 feeds、items 和 craft 模板页面）

**回滚策略**：如发现问题，可快速回滚（删除 `* 1000` 转换）

## Open Questions

无。修复方案明确，技术决策已完成。
