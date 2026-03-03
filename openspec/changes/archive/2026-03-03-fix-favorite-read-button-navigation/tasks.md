## 1. 修改 FavoriteButton 组件

- [x] 1.1 修改 components/items/FavoriteButton.tsx，将 handleToggle 函数接收 React.MouseEvent 参数并添加 e.stopPropagation()

## 2. 修改 ReadToggleButton 组件

- [x] 2.1 修改 components/items/ReadToggleButton.tsx，将 handleToggle 函数接收 React.MouseEvent 参数并添加 e.stopPropagation()

## 3. 创建 FavoriteButton 单元测试

- [x] 3.1 创建 __tests__/components/items/FavoriteButton.test.tsx
- [x] 3.2 测试点击按钮时调用 stopPropagation
- [x] 3.3 测试点击按钮时调用 toggleFavorite API
- [x] 3.4 测试点击按钮时更新组件状态和 Context 计数

## 4. 创建 ReadToggleButton 单元测试

- [x] 4.1 创建 __tests__/components/items/ReadToggleButton.test.tsx
- [x] 4.2 测试点击按钮时调用 stopPropagation
- [x] 4.3 测试点击按钮时调用 markAsRead API
- [x] 4.4 测试点击按钮时更新组件状态

## 5. 验证与测试

- [x] 5.1 运行 pnpm test __tests__/components/items/ 并确认全部通过
- [x] 5.2 运行 pnpm test __tests__/components/items/ItemCard.test.tsx 并确认全部通过
- [x] 5.3 运行 pnpm lint 并确认无 error（无新增 warning）
- [x] 5.4 运行 pnpm exec tsc --noEmit 确认零类型错误
