## 1. 基础设施

- [x] 1.1 创建 `lib/time/format-relative.ts` 相对时间格式化工具函数
- [x] 1.2 编写 `__tests__/lib/time/format-relative.test.ts` 单元测试（Red）
- [x] 1.3 实现 `format-relative.ts` 使测试通过（Green）

## 2. Hook 修复

- [x] 2.1 编写 `__tests__/hooks/useSidebar.test.ts` 失败用例：验证 SSR 环境下不抛错（Red）
- [x] 2.2 修复 `hooks/useSidebar.ts`：将 localStorage 读取移至 useEffect
- [x] 2.3 运行 `pnpm test __tests__/hooks/useSidebar.test.ts` 并确认全部通过（Green）

## 3. UI 组件优化

- [x] 3.1 修改 `components/ui/Button.tsx`：移除重复的 `default` variant
- [x] 3.2 检查并更新使用 `variant="default"` 的组件为 `variant="primary"`
- [x] 3.3 修改 `components/ai/AIConfigCard.tsx`：将 emoji 菜单图标替换为 `lucide-react` 的 `MoreVertical`

## 4. 性能优化

- [x] 4.1 编写 `__tests__/lib/utils/memo-helpers.test.ts` 失败用例：验证 useMemo 依赖项正确性（Red）
- [x] 4.2 修改 `components/items/ItemList.tsx`：为排序逻辑添加 useMemo
- [x] 4.3 修改 `components/ai/AIConfigCard.tsx`：为 provider 查找添加 useMemo
- [x] 4.4 修改 `components/feeds/FeedCard.tsx`：使用 `format-relative.ts` 替换内联 formatDate
- [x] 4.5 运行 `pnpm test __tests__/lib/utils/memo-helpers.test.ts` 并确认全部通过（Green）

## 5. 验证与清理

- [ ] 5.1 手工验证 Sidebar：刷新页面后折叠状态正确保持，无闪烁
- [ ] 5.2 手工验证 ItemList：切换排序时列表正确排序，无性能问题
- [ ] 5.3 手工验证 AIConfigCard：菜单图标显示正确，provider 信息正确
- [x] 5.4 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 5.5 运行 `pnpm exec tsc --noEmit` 确认零类型错误
