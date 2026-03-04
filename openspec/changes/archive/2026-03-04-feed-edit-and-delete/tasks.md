## 1. 修改 FeedCard 组件

- [x] 1.1 在 FeedCard.tsx 添加 onOpenSettings?(feed: Feed) 属性
- [x] 1.2 连接设置按钮（⋮）到 onOpenSettings 回调，移除 TODO 注释

## 2. 简化 FeedList 组件

- [x] 2.1 修改 FeedList.tsx 为接受 feeds: Feed[] 和 onOpenSettings(feed: Feed) 作为 props
- [x] 2.2 移除 FeedList 中的数据获取逻辑（fetchFeeds、useEffect）
- [x] 2.3 将 onOpenSettings 传递给每个 FeedCard 组件

## 3. 增强 FeedsPage 页面

- [x] 3.1 将 app/(dashboard)/feeds/page.tsx 转换为客户端组件（添加 'use client'）
- [x] 3.2 添加数据状态：feeds、loading、error
- [x] 3.3 添加 Modal 状态：isSettingsOpen、settingsFeed、isDeleteOpen、deleteFeed
- [x] 3.4 添加加载状态：isSaving、isDeleting
- [x] 3.5 实现 handleOpenSettings 处理函数
- [x] 3.6 实现 handleSaveSettings 处理函数（调用 updateFeed API + 刷新 feeds）
- [x] 3.7 实现 handleOpenDelete 处理函数
- [x] 3.8 实现 handleDelete 处理函数（调用 deleteFeed API + 刷新 feeds）
- [x] 3.9 条件渲染 FeedSettingsModal（当 isSettingsOpen 时）
- [x] 3.10 条件渲染 DeleteFeedConfirm（当 isDeleteOpen 时）
- [x] 3.11 传递 feeds 和 onOpenSettings 给 FeedList 组件

## 4. 代码质量检查

- [x] 4.1 运行 pnpm lint 并确认无 error（无新增 warning）
- [x] 4.2 运行 pnpm exec tsc --noEmit 确认零类型错误

## 5. 手工验证

- [x] 5.1 手工验证 /feeds 页面：点击订阅卡片的设置按钮，应打开 FeedSettingsModal
- [x] 5.2 手工验证编辑功能：修改订阅标题和分类，点击保存，列表应更新显示修改后的值
- [x] 5.3 手工验证删除功能：在设置弹窗点击"删除此订阅"，应打开删除确认弹窗
- [x] 5.4 手工验证删除确认：在确认弹窗点击"确认删除"，订阅应从列表中移除
- [x] 5.5 手工验证取消操作：点击任一弹窗的"取消"按钮，弹窗应关闭且不执行操作
- [x] 5.6 手工验证错误处理：断网状态下尝试保存/删除，应显示错误信息且弹窗保持打开
