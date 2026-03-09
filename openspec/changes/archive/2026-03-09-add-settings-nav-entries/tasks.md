## 1. 配置修改

- [x] 1.1 更新 `NavigationItemId` 类型，新增 `craft` 和 `pipelines` 值
- [x] 1.2 在 `navigationItems` 数组中添加「Craft 模板」导航项（使用 `FileText` 图标，链接到 `/settings/craft`）
- [x] 1.3 在 `navigationItems` 数组中添加「管道」导航项（使用 `GitBranch` 图标，链接到 `/settings/pipelines`）

## 2. 验证

- [x] 2.1 手工验证侧边栏导航：启动开发服务器 `pnpm dev`，登录后检查侧边栏是否显示「Craft 模板」和「管道」入口
- [x] 2.2 手工验证链接功能：点击「Craft 模板」入口，确认导航到 `/settings/craft` 页面
- [x] 2.3 手工验证链接功能：点击「管道」入口，确认导航到 `/settings/pipelines` 页面

## 3. 代码质量

- [x] 3.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 3.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
