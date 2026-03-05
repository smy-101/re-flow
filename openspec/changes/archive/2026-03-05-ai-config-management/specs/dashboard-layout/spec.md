## ADDED Requirements

### Requirement: AI 设置导航入口

系统 SHALL 在侧边栏提供 AI 设置页面的导航入口。

#### Scenario: 显示 AI 设置导航
- **WHEN** 用户在仪表盘布局中
- **THEN** 侧边栏显示"AI 设置"导航项
- **AND** 点击后导航到 `/settings/ai`

#### Scenario: AI 设置导航位置
- **WHEN** 侧边栏渲染导航项
- **THEN** "AI 设置"项位于"分类管理"之后或设置相关区域

---

### Requirement: AI 设置页面布局

系统 SHALL 为 AI 设置页面提供与仪表盘一致的布局。

#### Scenario: AI 设置页面布局
- **WHEN** 用户访问 `/settings/ai`
- **THEN** 系统应用仪表盘布局
- **AND** 顶部显示导航栏
- **AND** 侧边栏显示导航项
- **AND** AI 设置导航项处于激活状态
