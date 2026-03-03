## 1. 基础设施

- [x] 1.1 安装 lucide-react 图标库依赖
- [x] 1.2 创建导航配置文件 lib/config/navigation.ts 定义导航项映射

## 2. 核心逻辑

- [x] 2.1 创建 hooks/useSidebar.ts 实现边栏状态管理和 LocalStorage 持久化
- [x] 2.2 创建 hooks/useMobileDrawer.ts 实现移动端抽屉开关状态管理

## 3. UI 组件

- [x] 3.1 创建 components/layout/SidebarItem.tsx 实现单个导航项组件（含激活状态、图标显示）
- [x] 3.2 创建 components/layout/Sidebar.tsx 实现主侧边栏组件（含折叠/展开、导航列表、折叠按钮）
- [x] 3.3 创建 components/layout/MobileDrawer.tsx 实现移动端抽屉组件（含遮罩、导航列表、关闭逻辑）
- [x] 3.4 修改 components/layout/DashboardNavbar.tsx 移除导航链接，添加汉堡菜单按钮（移动端显示）
- [x] 3.5 修改 app/(dashboard)/layout.tsx 引入侧边栏布局，重构为左右结构

## 4. 测试

- [x] 4.1 创建 __tests__/hooks/useSidebar.test.ts 测试边栏状态管理和持久化
- [x] 4.2 创建 __tests__/hooks/useMobileDrawer.test.ts 测试移动端抽屉状态管理
- [x] 4.3 创建 __tests__/components/layout/SidebarItem.test.tsx 测试导航项激活状态和图标显示
- [x] 4.4 创建 __tests__/components/layout/Sidebar.test.tsx 测试侧边栏折叠/展开功能
- [x] 4.5 创建 __tests__/components/layout/MobileDrawer.test.tsx 测试移动端抽屉交互

## 5. 代码质量

- [x] 5.1 运行 pnpm lint 并确认无 error（无新增 warning）
- [x] 5.2 运行 pnpm test 并确认全部通过（无失败/无报错）
- [x] 5.3 运行 pnpm exec tsc --noEmit 确认零类型错误
