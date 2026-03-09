## Purpose

定义管道设置页面在侧边栏导航中的入口行为。

## Requirements

### Requirement: 导航菜单包含管道入口
系统 SHALL 在侧边栏导航菜单中提供「管道」入口。

#### Scenario: 用户查看导航菜单
- **WHEN** 用户打开应用程序的侧边栏
- **THEN** 导航菜单中显示「管道」入口

### Requirement: 管道入口链接正确
系统 SHALL 将「管道」导航项链接到 `/settings/pipelines` 路径。

#### Scenario: 用户点击管道入口
- **WHEN** 用户点击侧边栏中的「管道」导航项
- **THEN** 系统导航到 `/settings/pipelines` 页面
