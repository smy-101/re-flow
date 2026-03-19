## Purpose

扩展现有性能优化规范，增加 API 路由并行化和 Bundle 优化要求。

## ADDED Requirements

### Requirement: API 路由并行化
系统SHALL在 API 路由中使用 `Promise.all()` 并行化独立的异步操作。

#### Scenario: 认证与请求体并行
- **GIVEN** API 路由需要验证用户身份并解析请求体
- **WHEN** 处理 POST/PUT 请求
- **THEN** 系统使用 `Promise.all()` 并行执行认证和 JSON 解析
- **AND** 减少请求处理时间

#### Scenario: 独立数据库查询并行
- **GIVEN** API 需要查询多个无依赖关系的数据
- **WHEN** 执行查询操作
- **THEN** 系统使用 `Promise.all()` 并行执行查询
- **AND** 例如 feed 和 template 查询并行执行

#### Scenario: 关联数据预加载
- **GIVEN** 处理流程需要多个步骤的数据
- **WHEN** 可以提前确定所需数据
- **THEN** 系统在步骤开始前预加载所有可能需要的数据
- **AND** 避免循环中的串行查询

### Requirement: 动态导入优化
系统SHALL使用 `next/dynamic` 延迟加载非首屏必需的组件。

#### Scenario: 模态框动态导入
- **GIVEN** 页面包含仅在用户交互时显示的模态框
- **WHEN** 页面初始加载
- **THEN** 模态框组件使用 `next/dynamic` 动态导入
- **AND** 配置 `ssr: false` 跳过服务端渲染

#### Scenario: 条件组件动态导入
- **GIVEN** 某功能仅在特定条件下启用
- **WHEN** 条件不满足时
- **THEN** 相关组件代码不加载
- **AND** 减少初始 bundle 体积

### Requirement: Barrel 导入规范
系统SHALL从 barrel file 导入 UI 组件，确保 tree-shaking 有效。

#### Scenario: UI 组件导入
- **GIVEN** 组件需要使用 Button、Card 等 UI 组件
- **WHEN** 编写导入语句
- **THEN** 系统从 `@/components/ui` 导入
- **AND** 避免从具体文件路径导入
