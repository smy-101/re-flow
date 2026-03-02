## 1. 后端 API 实现

- [x] 1.1 创建 `app/api/items/mark-all-read/route.ts` - 实现标记所有未读文章的 API 端点
- [x] 1.2 创建 `app/api/feeds/[feedId]/mark-all-read/route.ts` - 实现标记特定订阅未读文章的 API 端点
- [x] 1.3 在 `lib/api/items.ts` 中新增 `markAllAsRead()` 客户端函数

## 2. 组件实现

- [x] 2.1 创建 `components/items/MarkAllReadConfirm.tsx` - 确认对话框组件
- [x] 2.2 修改 `components/items/ItemList.tsx` Props 接口 - 将 `filterUnread` 替换为 `filterStatus`
- [x] 2.3 修改 `components/items/ItemList.tsx` API 调用逻辑 - 根据 `filterStatus` 设置 `isRead` 参数
- [x] 2.4 修改 `components/items/ItemList.tsx` 空状态消息 - 添加"暂无已读文章"状态
- [x] 2.5 在 `components/items/ItemList.tsx` 中集成 `MarkAllReadConfirm` 和"全部标记为已读"按钮

## 3. 页面更新

- [x] 3.1 更新 `app/(dashboard)/items/page.tsx` - 将 `ItemList` props 改为 `filterStatus="all"`
- [x] 3.2 更新 `app/(dashboard)/items/unread/page.tsx` - 将 props 改为 `filterStatus="unread" showMarkAllRead`
- [x] 3.3 更新 `app/(dashboard)/feeds/[feedId]/page.tsx` - 将 props 改为 `filterStatus={filter} showMarkAllRead={filter === 'unread'}`

## 4. 测试

- [x] 4.1 为 `components/items/MarkAllReadConfirm.tsx` 编写单元测试
- [x] 4.2 更新 `components/items/ItemList.tsx` 的单元测试 - 覆盖新的 `filterStatus` 逻辑
- [x] 4.3 为新增的 API 端点编写集成测试

## 5. 代码质量检查

- [x] 5.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 5.2 运行 `pnpm test` 并确认全部通过（无失败/无报错）
- [x] 5.3 运行 `pnpm exec tsc --noEmit` 确认零类型错误
