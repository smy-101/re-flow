## 1. 基础设施

- [x] 1.1 创建 app/(dashboard) 目录结构
- [x] 1.2 创建 components/{feeds,items,layout,ui} 目录结构
- [x] 1.3 创建 lib/mock-data.ts，定义 Feed、FeedItem 类型接口
- [x] 1.4 在 lib/mock-data.ts 中实现 mock 数据生成函数（生成 10 个示例订阅和 50 篇示例文章）
- [x] 1.5 在 lib/mock-data.ts 中实现异步 API 模拟函数（fetchFeeds、fetchFeedById、createFeed、updateFeed、deleteFeed、fetchItems、fetchItemById、markAsRead、toggleFavorite）
- [x] 1.6 添加模拟网络延迟（300-800ms）到所有 API 函数

## 2. 布局组件

- [x] 2.1 创建 app/(dashboard)/layout.tsx（DashboardLayout Server Component）
- [x] 2.2 创建 components/layout/DashboardNavbar.tsx（Client Component，包含 Logo、主导航、搜索框占位）
- [x] 2.3 创建 components/layout/UserMenu.tsx（Client Component，用户下拉菜单）
- [x] 2.4 在 DashboardNavbar 中集成 UserMenu，实现退出登录功能
- [x] 2.5 添加移动端响应式样式（导航栏在小屏幕上的适配）

## 3. 通用 UI 组件

- [x] 3.1 创建 components/ui/Button.tsx（支持 primary、secondary、danger 变体，支持 disabled 和 loading 状态）
- [x] 3.2 创建 components/ui/Card.tsx（基础卡片容器组件）
- [x] 3.3 创建 components/ui/Input.tsx（文本输入框，支持错误状态显示）
- [x] 3.4 创建 components/ui/LoadingSpinner.tsx（加载动画组件）
- [x] 3.5 创建 components/ui/Modal.tsx（模态对话框组件）

## 4. RSS 订阅组件

- [x] 4.1 创建 components/feeds/FeedCard.tsx（订阅卡片组件，显示标题、分类、未读数、更新时间）
- [x] 4.2 创建 components/feeds/FeedList.tsx（订阅列表容器组件，支持分页）
- [x] 4.3 创建 components/feeds/AddFeedForm.tsx（添加订阅表单组件，包含 URL 输入、名称输入、分类选择）
- [x] 4.4 创建 components/feeds/FeedPreview.tsx（Feed 预览组件，显示 Feed 验证结果）
- [x] 4.5 创建 components/feeds/FeedSettingsModal.tsx（订阅设置弹窗，支持编辑名称、分类、删除订阅）
- [x] 4.6 创建 components/feeds/DeleteFeedConfirm.tsx（删除订阅确认对话框）

## 5. RSS 文章组件

- [x] 5.1 创建 components/items/ItemCard.tsx（文章卡片组件，显示标题、来源、时间、阅读时长、摘要）
- [x] 5.2 创建 components/items/ItemList.tsx（文章列表容器组件，支持筛选和排序）
- [x] 5.3 创建 components/items/ItemContent.tsx（文章详情内容组件，显示完整文章内容）
- [x] 5.4 创建 components/items/ItemNavigation.tsx（文章导航组件，上一篇/下一篇按钮）
- [x] 5.5 创建 components/items/ReadToggleButton.tsx（已读/未读状态切换按钮）
- [x] 5.6 创建 components/items/FavoriteButton.tsx（收藏按钮组件）

## 6. 页面实现

- [x] 6.1 创建 app/(dashboard)/feeds/page.tsx（订阅列表页，调用 fetchFeeds API，显示 FeedList）
- [x] 6.2 创建 app/(dashboard)/feeds/add/page.tsx（添加订阅页，包含 AddFeedForm，处理表单提交）
- [x] 6.3 创建 app/(dashboard)/feeds/[feedId]/page.tsx（订阅详情页，调用 fetchFeedById 和 fetchItems API，显示订阅信息和文章列表）
- [x] 6.4 创建 app/(dashboard)/items/page.tsx（所有文章列表页，调用 fetchItems API，显示所有文章）
- [x] 6.5 创建 app/(dashboard)/items/unread/page.tsx（未读文章页，调用 fetchItems API 并筛选未读文章）
- [x] 6.6 创建 app/(dashboard)/items/[itemId]/page.tsx（文章详情页，调用 fetchItemById API，显示 ItemContent 和导航）
- [x] 6.7 在所有页面添加错误处理和加载状态显示
- [x] 6.8 在所有页面添加空状态处理（无订阅、无文章等）

## 7. 页面间导航和路由

- [x] 7.1 在 FeedCard 中添加点击跳转到订阅详情页的功能
- [x] 7.2 在 ItemCard 中添加点击跳转到文章详情页的功能
- [x] 7.3 在文章详情页实现上一篇/下一篇导航功能
- [x] 7.4 在各子页面添加"返回"按钮（如从订阅详情返回订阅列表）
- [x] 7.5 优化浏览器历史记录管理

## 8. 单元测试

- [x] 8.1 创建 __tests__/components/ui/Button.test.tsx（测试 Button 组件的渲染和交互）
- [x] 8.2 创建 __tests__/components/feeds/FeedCard.test.tsx（测试 FeedCard 组件的渲染和点击事件）
- [x] 8.3 创建 __tests__/components/feeds/AddFeedForm.test.tsx（测试表单验证和提交）
- [x] 8.4 创建 __tests__/components/items/ItemCard.test.tsx（测试 ItemCard 组件的渲染和状态切换）
- [x] 8.5 创建 __tests__/lib/mock-data.test.ts（测试 mock 数据函数的正确性）
- [x] 8.6 创建 app/(dashboard)/feeds/page.test.tsx（测试订阅列表页的渲染和交互）
- [x] 8.7 创建 app/(dashboard)/items/page.test.tsx（测试文章列表页的渲染和筛选）

## 9. 样式和响应式设计

- [x] 9.1 在所有组件中添加移动端响应式类（sm:、md:、lg: 断点）
- [x] 9.2 优化订阅卡片在移动端的显示（紧凑布局）
- [x] 9.3 优化文章卡片在移动端的显示（隐藏次要信息）
- [x] 9.4 测试并调整各种屏幕尺寸下的布局表现
- [x] 9.5 添加深色模式支持（可选）

## 10. 代码质量检查

- [x] 10.1 运行 pnpm lint 并确认无 error（无新增 warning）
- [x] 10.2 运行 pnpm test 并确认全部通过（无失败/无报错）
- [x] 10.3 运行 pnpm exec tsc --noEmit 确认零类型错误
