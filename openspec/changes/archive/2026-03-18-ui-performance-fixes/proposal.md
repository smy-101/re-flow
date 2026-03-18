## Why

当前项目存在多处 React 性能优化机会和 UI 设计一致性问题。主要问题包括：缺少 `useMemo` 导致不必要的重排序计算、`useSidebar` hook 的 hydration mismatch 风险、Button 组件存在重复 variant 定义、以及部分组件使用 emoji 替代图标库。这些问题影响用户体验和代码可维护性，需要系统性地修复。

## What Changes

- **修复 `useSidebar` hydration 问题**：将 localStorage 读取移至 `useEffect` 中，避免 SSR/客户端不一致
- **`ItemList` 添加 `useMemo`**：对排序逻辑进行记忆化，避免每次渲染重新排序大列表
- **`FeedCard.formatDate` 提取为工具函数**：将日期格式化逻辑提取到 `lib/time/` 目录
- **移除 Button 组件重复 variant**：删除 `default` variant，统一使用 `primary`
- **统一图标使用**：将 `AIConfigCard` 中的 emoji 菜单图标替换为 `lucide-react` 的 `MoreVertical`
- **优化 `AIConfigCard` provider 查找**：使用 `useMemo` 缓存 provider 查找结果

## Capabilities

### New Capabilities

- `performance-optimization`: React 组件性能优化模式，包括 useMemo、useCallback 的正确使用场景和规范

### Modified Capabilities

- `ui-components`: 修改 Button 组件的 variant 定义，统一图标使用规范

## Impact

**受影响文件：**
- `hooks/useSidebar.ts` — 修复 hydration 逻辑
- `components/items/ItemList.tsx` — 添加 useMemo 优化
- `components/feeds/FeedCard.tsx` — 提取 formatDate 函数
- `components/ui/Button.tsx` — 移除重复 variant
- `components/ai/AIConfigCard.tsx` — 替换 emoji 图标，添加 useMemo

**新增文件：**
- `lib/time/format-relative.ts` — 相对时间格式化工具函数

**影响范围：** 仅影响客户端组件的内部实现，不影响 API 和数据库层
