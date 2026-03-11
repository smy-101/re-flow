## ADDED Requirements

### Requirement: 组件使用语义化颜色 Token

系统 SHALL 确保所有组件使用语义化颜色 token（如 `bg-card`、`text-foreground`、`border-border`）而非硬编码颜色值（如 `bg-white`、`text-gray-900`）。

#### Scenario: 亮色模式下组件渲染正确
- **WHEN** 用户在亮色模式下访问包含已迁移组件的页面
- **THEN** 所有组件使用语义化 token 渲染，视觉效果与迁移前一致

#### Scenario: 暗色模式下组件渲染正确
- **WHEN** 用户切换到暗色模式并访问包含已迁移组件的页面
- **THEN** 所有组件自动适配暗色主题，无硬编码白色或灰色背景

### Requirement: 交互元素具有微交互动画

系统 SHALL 为交互元素（按钮、卡片、链接）提供过渡动画，包括 hover、active、focus 状态。

#### Scenario: 按钮具有 hover 过渡效果
- **WHEN** 用户将鼠标悬停在按钮上
- **THEN** 按钮在 150ms 内平滑过渡到 hover 状态颜色

#### Scenario: 卡片具有 hover 阴影效果
- **WHEN** 用户将鼠标悬停在可点击卡片上
- **THEN** 卡片在 200ms 内显示 `shadow-md` 效果

#### Scenario: 动画尊重用户偏好
- **WHEN** 用户系统设置为 `prefers-reduced-motion: reduce`
- **THEN** 所有动画过渡被禁用或缩短时长

### Requirement: 表单控件具有可访问性

系统 SHALL 确保所有表单控件具有正确的 label 关联、autocomplete 属性和 focus 状态。

#### Scenario: 输入框具有 label 关联
- **WHEN** 用户点击输入框的 label 文本
- **THEN** 对应的输入框获得焦点

#### Scenario: 输入框具有 focus-visible 状态
- **WHEN** 用户通过键盘 Tab 导航到输入框
- **THEN** 输入框显示 `focus-visible:ring-2` 焦点环

#### Scenario: 认证表单具有 autocomplete
- **WHEN** 用户在登录或注册表单中输入
- **THEN** 浏览器可根据 autocomplete 属性提供自动填充建议

### Requirement: 内容容器处理长文本

系统 SHALL 确保文本容器能正确处理长内容，使用 `truncate`、`line-clamp-*` 或 `break-words`。

#### Scenario: 卡片标题超长时截断
- **WHEN** 卡片标题超过容器宽度
- **THEN** 标题使用 `truncate` 或 `line-clamp-2` 截断并显示省略号

#### Scenario: Flex 子元素允许截断
- **WHEN** Flex 容器中的文本需要截断
- **THEN** 父元素具有 `min-w-0` 以允许子元素收缩

### Requirement: ProcessDialog 使用 Dialog 组件

系统 SHALL 使用已迁移的 `Dialog` 组件替换 `ProcessDialog` 中的旧 `Modal` 组件。

#### Scenario: 处理对话框在暗色模式下渲染正确
- **WHEN** 用户在暗色模式下打开处理文章对话框
- **THEN** 对话框使用 `bg-popover`、`text-popover-foreground` 等语义化 token
