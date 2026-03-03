## 1. 数据库迁移

- [x] 1.1 在 `lib/db/schema.ts` 中为 `feedItems.isFavorite` 字段添加索引定义
- [x] 1.2 运行 `pnpm exec drizzle-kit generate` 生成迁移文件
- [x] 1.3 运行 `pnpm exec drizzle-kit migrate` 应用迁移

## 2. 后端 API

- [x] 2.1 创建 `app/api/favorites/count/route.ts` 实现收藏数量查询端点
- [x] 2.2 在 `lib/api/feeds.ts` 或 `lib/api/items.ts` 中添加 `fetchFavoriteCount()` 客户端函数

## 3. 状态管理

- [x] 3.1 创建 `lib/context/FavoriteContext.tsx` 提供收藏数量状态和更新方法
- [x] 3.2 在 `app/(dashboard)/layout.tsx` 中包裹 `FavoriteProvider`

## 4. 收藏页面

- [x] 4.1 创建 `app/(dashboard)/favorites/page.tsx` 收藏页面组件
- [x] 4.2 修改 `components/items/ItemList.tsx` 支持收藏页面的筛选和排序显示

## 5. 导航更新

- [x] 5.1 修改 `lib/config/navigation.ts` 移除收藏项的 `disabled: true` 标记
- [x] 5.2 修改侧边栏组件，使其在展开时显示收藏数量，折叠时仅显示图标

## 6. 组件集成

- [x] 6.1 修改 `components/items/FavoriteButton.tsx` 调用 Context 更新收藏数量

## 7. 单元测试

- [x] 7.1 创建 `__tests__/app/api/favorites/count/route.test.ts` 测试收藏数量 API
- [x] 7.2 创建 `__tests__/lib/context/FavoriteContext.test.tsx` 测试 Context 状态管理
- [x] 7.3 创建 `__tests__/app/(dashboard)/favorites/page.test.tsx` 测试收藏页面渲染

## 8. 集成测试与验证

- [x] 8.1 运行 `pnpm test __tests__/app/api/favorites/count/` 并确认全部通过
- [x] 8.2 运行 `pnpm test __tests__/lib/context/` 并确认全部通过
- [x] 8.3 运行 `pnpm test __tests__/app/\(dashboard\)/favorites/` 并确认全部通过
- [ ] 8.4 手动验证收藏页面功能：访问 `/favorites`、筛选订阅、切换排序、取消收藏
- [ ] 8.5 手动验证导航栏数量更新：收藏/取消收藏后导航数量实时变化

## 9. 代码质量检查

- [x] 9.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 9.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
