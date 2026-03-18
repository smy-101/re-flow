## Context

当前项目在 React 性能优化和 UI 一致性方面存在以下问题：

1. **Hydration Mismatch 风险**：`useSidebar` hook 在 `useState` 初始化时直接读取 `localStorage`，导致服务端渲染与客户端初始状态不一致
2. **缺少记忆化**：`ItemList` 组件每次渲染都对完整列表进行排序，`AIConfigCard` 每次渲染都重新查找 provider
3. **代码重复**：`Button` 组件的 `default` 和 `primary` variant 定义完全相同
4. **图标不一致**：`AIConfigCard` 使用 emoji (⋮) 作为菜单图标，而其他组件使用 `lucide-react`

## Goals / Non-Goals

**Goals:**
- 修复 hydration mismatch 问题，确保 SSR/客户端状态一致
- 对频繁计算添加 `useMemo` 优化
- 统一代码风格，移除重复定义
- 统一图标使用规范

**Non-Goals:**
- 不涉及 API 层或数据库层修改
- 不引入新的第三方库
- 不修改组件对外 API 接口

## Decisions

### 1. useSidebar Hydration 修复策略

**决策**：将 `localStorage` 读取移至 `useEffect` 中

**备选方案**：
- A) `useEffect` 中读取（采用）— 简单可靠，首次渲染使用默认值
- B) 使用 `useSyncExternalStore` — 过度设计，localStorage 不是外部 store

**理由**：`useEffect` 方案简单直接，避免了复杂的订阅逻辑，同时保证 hydration 一致性

### 2. 记忆化策略

**决策**：对排序和查找逻辑使用 `useMemo`

**理由**：
- `ItemList` 排序：列表可能很大，每次渲染都排序是 O(n log n) 复杂度
- `AIConfigCard` provider 查找：虽然复杂度低，但该组件可能被多次渲染

### 3. formatDate 提取策略

**决策**：提取为 `lib/time/format-relative.ts` 工具函数

**理由**：
- 复用性：其他组件可能需要相同的相对时间格式化
- 可测试性：纯函数更容易单元测试
- 与现有 `lib/time/timestamp.ts` 保持一致的目录结构

### 4. Button Variant 清理

**决策**：移除 `default` variant，保留 `primary` 作为默认

**理由**：
- `default` 和 `primary` 定义完全相同，造成混淆
- `primary` 语义更清晰，表示主要操作

## Risks / Trade-offs

### Risk 1: useSidebar 首次渲染闪烁
- **风险**：使用 `useEffect` 读取 localStorage 会导致首次渲染使用默认值，可能出现短暂的展开→收起闪烁
- **缓解**：闪烁只发生在用户之前选择收起且页面刷新时，影响范围小；可接受

### Risk 2: useMemo 依赖项错误
- **风险**：`useMemo` 依赖项设置不当可能导致缓存失效或状态不同步
- **缓解**：严格审查依赖项数组，使用 TypeScript 类型检查

## Migration Plan

1. **Phase 1**: 创建 `lib/time/format-relative.ts` 工具函数
2. **Phase 2**: 修改 `hooks/useSidebar.ts`
3. **Phase 3**: 修改 `components/ui/Button.tsx`
4. **Phase 4**: 修改 `components/items/ItemList.tsx`
5. **Phase 5**: 修改 `components/feeds/FeedCard.tsx`
6. **Phase 6**: 修改 `components/ai/AIConfigCard.tsx`

**回滚策略**：每个修改都是独立的，可以单独回滚
