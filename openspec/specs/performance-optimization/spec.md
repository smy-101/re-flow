## Purpose

定义 React 应用的性能优化规范，包括组件记忆化、SSR Hydration 一致性、API 路由并行化和 Bundle 优化标准，确保应用具有可预测的性能表现和良好的用户体验。

## Requirements

### Requirement: React 组件记忆化规范
系统SHALL对计算密集型或频繁执行的渲染逻辑使用 React 记忆化 Hook，以避免不必要的重计算和重渲染。

#### Scenario: 列表排序使用 useMemo
- **GIVEN** 组件需要根据排序规则对列表进行排序
- **WHEN** 列表数据或排序规则发生变化
- **THEN** 系统使用 `useMemo` 缓存排序结果
- **AND** 仅在依赖项变化时重新计算排序

#### Scenario: 对象查找使用 useMemo
- **GIVEN** 组件需要从数组中查找特定对象
- **WHEN** 查找依赖项（如数组或查找键）发生变化
- **THEN** 系统使用 `useMemo` 缓存查找结果
- **AND** 避免每次渲染都执行查找逻辑

### Requirement: SSR Hydration 一致性
系统SHALL确保服务端渲染与客户端初始渲染的状态一致，避免 hydration mismatch 警告。

#### Scenario: localStorage 读取时机正确
- **GIVEN** 组件需要从 localStorage 读取持久化状态
- **WHEN** 组件在服务端渲染或客户端首次渲染
- **THEN** 系统使用默认值作为初始状态
- **AND** 在 `useEffect` 中读取并更新 localStorage 值

#### Scenario: 避免客户端闪烁
- **GIVEN** 用户刷新页面且之前保存了非默认状态
- **WHEN** 页面完成 hydration
- **THEN** 系统在首个动画帧前完成状态同步
- **AND** 用户不会观察到明显的状态跳变

### Requirement: 工具函数提取规范
系统SHALL将组件内的纯函数逻辑提取为独立的工具函数，以提高复用性和可测试性。

#### Scenario: 格式化函数提取为工具
- **GIVEN** 组件内部定义了日期格式化等纯函数
- **WHEN** 该函数可能被其他组件复用
- **THEN** 系统将函数提取到 `lib/` 目录下
- **AND** 工具函数具有清晰的类型签名和单元测试

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
