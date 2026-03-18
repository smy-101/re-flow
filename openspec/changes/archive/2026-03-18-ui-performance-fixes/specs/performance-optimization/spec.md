## ADDED Requirements

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
