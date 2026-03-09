## Context

当前项目使用 `lib/config/navigation.ts` 定义侧边栏导航项，通过 `navigationItems` 数组导出导航配置。现有导航包含「我的订阅」、「我的阅读」、「收藏」、「AI 设置」和「中转」五个入口。设置相关的页面（`/settings/craft` 和 `/settings/pipelines`）已存在但缺少导航入口。

## Goals / Non-Goals

**Goals:**
- 在侧边栏导航中新增「Craft 模板」和「管道」两个设置相关入口
- 确保新入口链接正确指向对应的设置页面

**Non-Goals:**
- 不修改设置页面本身的功能或样式
- 不改变现有导航项的位置或顺序

## Decisions

1. **图标选择**: 为保持视觉一致性，使用 `lucide-react` 中的图标：
   - Craft 模板使用 `FileText`（文档/模板图标）
   - 管道使用 `GitBranch`（流程/分支图标）

2. **导航项位置**: 将两个新入口放置在「AI 设置」之后，保持设置类功能相邻

3. **类型扩展**: 更新 `NavigationItemId` 类型，新增 `craft` 和 `pipelines` 两个值

## Risks / Trade-offs

- **风险**: 添加新导航项可能影响侧边栏在移动端的显示效果
  - **缓解**: 现有侧边栏已支持滚动，新增两项不会破坏布局

- **权衡**: 导航项增多可能使侧边栏更拥挤，但项目目前仅 5 项导航，新增 2 项仍在可接受范围
