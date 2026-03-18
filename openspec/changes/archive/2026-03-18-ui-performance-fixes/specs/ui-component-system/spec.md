## MODIFIED Requirements

### Requirement: 统一基础控件体系
系统SHALL为按钮、输入框、文本域、选择器、卡片和徽标提供统一的组件 API 与视觉状态，且不得存在重复的 variant 定义。

#### Scenario: 不同页面复用基础控件
- **GIVEN** 认证页、设置页和列表筛选区同时使用基础控件
- **WHEN** 这些页面渲染相同语义的控件
- **THEN** 系统提供一致的尺寸、圆角、留白和状态反馈
- **AND** 页面无需重复定义同类控件的核心视觉规则

#### Scenario: 基础控件覆盖常见状态
- **GIVEN** 用户与基础控件交互
- **WHEN** 控件进入默认、悬停、聚焦、禁用、加载或错误状态
- **THEN** 系统提供一致的交互反馈
- **AND** 这些状态在亮色与暗色模式下都可辨识

#### Scenario: Button variant 无重复定义
- **GIVEN** Button 组件定义多个 variant 选项
- **WHEN** 开发者使用 variant 属性
- **THEN** 系统确保每个 variant 具有唯一的样式定义
- **AND** 不存在语义相同但名称不同的 variant

## ADDED Requirements

### Requirement: 统一图标使用规范
系统SHALL在所有 UI 组件中使用统一的图标库（lucide-react），避免使用 emoji 或其他字符作为图标替代。

#### Scenario: 菜单图标使用 lucide-react
- **GIVEN** 组件需要展示操作菜单图标
- **WHEN** 渲染下拉菜单触发按钮
- **THEN** 系统使用 `lucide-react` 的 `MoreVertical` 或 `Ellipsis` 图标
- **AND** 不使用 emoji 字符（如 ⋮）作为图标

#### Scenario: 图标导入方式一致
- **GIVEN** 多个组件需要使用图标
- **WHEN** 导入图标组件
- **THEN** 系统统一从 `lucide-react` 导入
- **AND** 利用 tree-shaking 减少最终 bundle 体积
