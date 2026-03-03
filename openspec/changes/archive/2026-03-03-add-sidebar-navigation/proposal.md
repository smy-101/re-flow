## Why

当前导航位于顶部导航栏，扩展性有限。随着收藏、AI 助手、中转等功能的规划，顶部导航空间将变得拥挤。左侧边栏布局提供更好的可扩展性，便于未来添加更多功能入口，同时符合现代仪表盘应用的用户体验模式。

## What Changes

- 将"我的订阅"和"我的阅读"从顶部导航栏移至左侧可折叠边栏
- 新增左侧边栏组件，支持展开/收起两种状态
- 折叠状态下显示图标和提示，展开状态下显示图标和文字
- 边栏状态使用 LocalStorage 持久化
- 移动端（<768px）改为抽屉式导航（汉堡菜单）
- 顶部导航栏保留搜索框和用户菜单，移除原有导航链接

## Capabilities

### New Capabilities
- `sidebar-navigation`: 左侧可折叠边栏导航系统，包含展开/收起状态管理、移动端抽屉模式、导航项高亮显示等功能

### Modified Capabilities
- 无

## Impact

- 新增：`components/layout/Sidebar.tsx`（主侧边栏组件）
- 新增：`components/layout/SidebarItem.tsx`（单个导航项组件）
- 修改：`app/(dashboard)/layout.tsx`（引入侧边栏布局结构）
- 修改：`components/layout/DashboardNavbar.tsx`（移除导航链接，保留搜索和用户菜单）
- 移动端：新增汉堡菜单按钮，控制移动端抽屉开关
- 状态：新增 `useSidebar` hook 管理展开/收起状态，持久化到 LocalStorage
