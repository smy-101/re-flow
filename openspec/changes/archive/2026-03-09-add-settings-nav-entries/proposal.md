## Why

当前设置页面包含 AI 配置、Craft 模板和管道三个功能，但导航菜单中仅有「AI 设置」入口，用户无法直接访问 Craft 模板和管道设置页面，需要手动输入 URL 才能进入，影响用户体验。

## What Changes

- 在导航菜单中新增「Craft 模板」入口，链接到 `/settings/craft`
- 在导航菜单中新增「管道」入口，链接到 `/settings/pipelines`
- 保留现有的「AI 设置」入口

## Capabilities

### New Capabilities
- `settings-nav-craft`: Craft 模板设置页面的导航入口
- `settings-nav-pipelines`: 管道设置页面的导航入口

### Modified Capabilities
- `sidebar-navigation`: 增加两个新的导航项到侧边栏配置

## Impact

修改 `lib/config/navigation.ts`，在 `navigationItems` 数组中添加两个新的导航项。不涉及 API 或数据库变更，仅影响前端导航配置。
