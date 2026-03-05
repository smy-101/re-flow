## ADDED Requirements

### Requirement: 仪表盘共享布局

系统 SHALL 为所有受保护的页面提供统一的仪表盘布局。

#### Scenario: 访问受保护页面
- **GIVEN** 用户已登录
- **WHEN** 用户访问任何以 `/feeds` 或 `/items` 开头的页面
- **THEN** 系统应用仪表盘布局
- **AND** 顶部显示统一的导航栏
- **AND** 导航栏包含：Logo、主导航链接、搜索框（预留）、用户菜单

#### Scenario: 导航栏 Logo
- **GIVEN** 用户在任何受保护页面
- **WHEN** 用户点击导航栏的 Logo
- **THEN** 系统导航到订阅列表页 `/feeds`

#### Scenario: 主导航链接
- **GIVEN** 用户在任何受保护页面
- **WHEN** 用户点击"我的订阅"链接
- **THEN** 系统导航到 `/feeds` 订阅列表页
- **AND** 当用户点击"我的阅读"链接
- **THEN** 系统导航到 `/items` 文章列表页

---

### Requirement: 用户菜单

系统 SHALL 在导航栏提供用户菜单。

#### Scenario: 打开用户菜单
- **GIVEN** 用户在任何受保护页面
- **WHEN** 用户点击导航栏的用户头像或名称
- **THEN** 系统显示下拉菜单
- **AND** 菜单包含：用户名显示、退出登录选项

#### Scenario: 退出登录
- **GIVEN** 用户菜单已打开
- **WHEN** 用户点击"退出登录"
- **THEN** 系统清除用户认证信息
- **AND** 导航到登录页面 `/login`

---

### Requirement: 移动端响应式布局

系统 SHALL 在移动设备上提供适配的布局和导航。

#### Scenario: 移动端导航栏
- **GIVEN** 用户使用移动设备访问
- **WHEN** 用户访问任何受保护页面
- **THEN** 导航栏适配移动端宽度
- **AND** Logo、菜单按钮适当缩放

#### Scenario: 移动端底部导航栏（可选）
- **GIVEN** 用户使用移动设备访问
- **WHEN** 用户在文章或订阅列表页
- **THEN** 系统显示底部导航栏
- **AND** 底部导航提供快捷切换：订阅、文章、搜索、设置

---

### Requirement: 返回导航

系统 SHALL 在子页面提供返回上级页面的导航。

#### Scenario: 返回按钮
- **GIVEN** 用户在订阅详情页 `/feeds/[feedId]`
- **WHEN** 用户点击"返回列表"按钮
- **THEN** 系统导航回订阅列表页 `/feeds`

#### Scenario: 浏览器后退
- **GIVEN** 用户在文章详情页
- **WHEN** 用户点击浏览器的后退按钮
- **THEN** 系统返回到上一页（保持正确的导航历史）

---

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
