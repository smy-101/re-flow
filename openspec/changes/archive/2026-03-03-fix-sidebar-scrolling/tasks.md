## 1. 核心实现

- [x] 1.1 修改 app/(dashboard)/layout.tsx，将根容器的 className 从 `min-h-screen` 改为 `h-screen`，并给内层 flex 容器添加 `overflow-hidden`

## 2. 验证与测试

- [x] 2.1 运行 pnpm test __tests__/components/layout/Sidebar.test.tsx 并确认全部通过
- [x] 2.2 运行 pnpm test __tests__/hooks/useSidebar.test.ts 并确认全部通过

## 3. 代码质量检查

- [x] 3.1 运行 pnpm lint 并确认无 error（无新增 warning）
- [x] 3.2 运行 pnpm exec tsc --noEmit 确认零类型错误
