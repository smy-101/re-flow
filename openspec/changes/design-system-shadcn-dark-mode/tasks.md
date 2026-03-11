## 1. 基础设施

- [ ] 1.1 引入 shadcn/ui、主题切换和类名工具所需依赖
- [ ] 1.2 新增主题 Provider、组件配置和通用样式工具模块
- [ ] 1.3 重构 app/globals.css 建立语义化主题 token 与亮暗模式基础样式
- [ ] 1.4 重构 app/layout.tsx 接入全局主题 Provider、字体基线和主题初始化

## 2. 手工测试用例

- [ ] 2.1 编写手工测试用例 主题系统：Given 用户切换亮暗主题 When 刷新页面或重新进入站点 Then 主题保持一致且核心表面层级可读
- [ ] 2.2 编写手工测试用例 基础控件：Given 按钮、输入框、选择器、弹窗、抽屉、菜单 When 进入 hover、focus、disabled、error、loading 状态 Then 样式与交互保持一致
- [ ] 2.3 编写手工测试用例 dashboard 壳层：Given 用户在桌面端和移动端访问受保护页面 When 打开导航、切换页面和打开用户菜单 Then 顶栏、侧栏、抽屉和主题入口保持统一
- [ ] 2.4 编写手工测试用例 认证壳层：Given 用户访问登录、注册、忘记密码和重置密码页面 When 输入、报错、发送验证码和提交 Then 表单状态与反馈样式一致
- [ ] 2.5 编写手工测试用例 高频工作流：Given 用户使用添加订阅、AI 配置、订阅卡片和文章列表 When 验证、提交、刷新和切换状态 Then 表单、卡片、空状态和 Toast 反馈一致

## 3. 基础控件与主题实现

- [ ] 3.1 实现 components/ui 基础组件目录的 shadcn/ui 兼容入口
- [ ] 3.2 实现 components/ui/Button.tsx、Input.tsx、Card.tsx 的统一变体与主题样式
- [ ] 3.3 实现统一的 Textarea、Select、Badge、Skeleton 和反馈提示组件
- [ ] 3.4 实现 components/ui/Modal.tsx 到统一 Dialog 容器的迁移
- [ ] 3.5 实现统一的 Sheet、Dropdown Menu、Alert Dialog 和 Toast 容器

## 4. dashboard 壳层实现

- [ ] 4.1 实现 app/(dashboard)/layout.tsx 的新表面层级和容器节奏
- [ ] 4.2 实现 components/layout/DashboardNavbar.tsx 的统一顶栏、搜索占位和主题入口承载区
- [ ] 4.3 实现 components/layout/Sidebar.tsx 与 SidebarItem.tsx 的统一导航激活态和亮暗样式
- [ ] 4.4 实现 components/layout/MobileDrawer.tsx 到统一 Sheet 抽屉的迁移
- [ ] 4.5 实现 components/layout/UserMenu.tsx 到统一 Dropdown Menu 的迁移并接入主题切换入口

## 5. 认证壳层实现

- [ ] 5.1 实现认证页面共享容器、标题层级和反馈区结构
- [ ] 5.2 实现 app/login/page.tsx 与 app/register/page.tsx 的统一字段、按钮和状态提示样式
- [ ] 5.3 实现 app/forgot-password/page.tsx 与 app/reset-password/page.tsx 的统一字段、按钮和状态提示样式

## 6. 高频工作流实现

- [ ] 6.1 实现 components/feeds/AddFeedForm.tsx 的统一字段结构、选择器和反馈样式
- [ ] 6.2 实现 components/ai/AIConfigForm.tsx 的统一字段结构、说明区和提交反馈样式
- [ ] 6.3 实现 components/feeds/FeedCard.tsx 的统一卡片层级、操作按钮和 Toast 反馈
- [ ] 6.4 实现 components/items/ItemCard.tsx 与 components/items/ItemList.tsx 的统一卡片、筛选区、空状态和错误态样式

## 7. 手工回归验证

- [ ] 7.1 手工验证 主题系统：切换亮暗模式后 dashboard 与认证页在刷新后仍保持主题一致
- [ ] 7.2 手工验证 基础控件：按钮、输入框、选择器、弹窗、抽屉、菜单、Toast 在核心页面中的状态一致
- [ ] 7.3 手工验证 dashboard 壳层：桌面端与移动端均可完成导航、打开菜单、切换主题和退出登录
- [ ] 7.4 手工验证 认证壳层：登录、注册、忘记密码、重置密码页面的输入、报错、验证码和提交链路表现一致
- [ ] 7.5 手工验证 高频工作流：添加订阅、AI 配置、订阅刷新、文章列表浏览的表单、卡片和反馈状态一致

## 8. 校验

- [ ] 8.1 运行 pnpm lint 并确认无 error（无新增 warning）
- [ ] 8.2 运行 pnpm exec tsc --noEmit 确认零类型错误
