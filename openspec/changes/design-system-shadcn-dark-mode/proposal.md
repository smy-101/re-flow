## 背景与动机

当前前端样式由少量自制基础组件和大量页面内联样式混合构成，控件、反馈、壳层与认证页视觉语言分散，暗色模式也仅覆盖局部区域。现在需要以 shadcn/ui 为基础重建设计系统，先统一控件层，再重构高频界面，为后续持续调整组件和页面提供稳定基座。

## What Changes

- 建立基于 shadcn/ui 的主题 token、主题切换与亮暗双模体系
- 统一基础控件、反馈控件和交互容器，替换零散自制 UI 能力
- 重构 dashboard 壳层与认证壳层，统一导航、菜单、抽屉和表单体验
- 重构高频表单与列表卡片，使订阅、文章、AI 配置等核心路径落到统一设计系统

## Capabilities

### New Capabilities
- `theme-system`: 定义语义化设计 token、亮暗主题切换与主题持久化体验
- `ui-component-system`: 定义统一的基础控件、反馈组件与交互容器行为
- `auth-surface-ui`: 定义认证页在布局、表单、状态反馈和亮暗模式下的一致体验
- `workflow-surface-ui`: 定义高频业务表单、列表卡片、空状态与反馈样式的一致体验

### Modified Capabilities
- `dashboard-layout`: 调整仪表盘壳层的导航、菜单、移动端抽屉与主题入口要求

## 非目标（Non-goals）

不修改后端 API、数据库 schema 或业务规则；不在本次 change 中一次性重写所有低频页面；不引入与设计系统无关的新功能。

## Impact

影响 `app/layout.tsx`、`app/globals.css`、`app/(dashboard)`、认证页面、`components/ui`、`components/layout`、`components/feeds`、`components/items`、`components/ai` 等前端目录，并新增 shadcn/ui 相关依赖与主题基础设施。
