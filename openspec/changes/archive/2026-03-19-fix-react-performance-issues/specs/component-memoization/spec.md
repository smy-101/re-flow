## Purpose

定义 React 组件 memo 化规范，确保列表组件高效渲染，避免不必要的重渲染。

## ADDED Requirements

### Requirement: 列表项组件 Memo 化
系统SHALL对列表项组件使用 `React.memo` 包装，仅在 props 发生实际变化时重新渲染。

#### Scenario: ItemCard memo 化
- **WHEN** 父组件 ItemList 因其他 state 变化重渲染
- **THEN** ItemCard 组件仅在 `item` prop 变化时重渲染
- **AND** 未变化的 ItemCard 实例跳过渲染

#### Scenario: FeedCard memo 化
- **WHEN** 父组件 FeedList 重渲染
- **THEN** FeedCard 组件仅在 `feed` prop 变化时重渲染
- **AND** `onRefresh` 等回调使用 `useCallback` 保持引用稳定

#### Scenario: AIConfigCard memo 化
- **WHEN** 父组件 AIConfigList 重渲染
- **THEN** AIConfigCard 组件仅在 `config` prop 变化时重渲染

#### Scenario: PipelineCard memo 化
- **WHEN** 父组件 PipelineList 重渲染
- **THEN** PipelineCard 组件仅在 `pipeline` prop 变化时重渲染

### Requirement: 回调函数稳定化
系统SHALL使用 `useCallback` 包装传递给 memo 化组件的回调函数。

#### Scenario: 事件处理回调稳定化
- **GIVEN** 列表组件向子组件传递 `onEdit`、`onDelete` 回调
- **WHEN** 列表组件重渲染
- **THEN** 回调函数引用保持稳定
- **AND** 不触发子组件重渲染

### Requirement: 派生状态计算优化
系统SHALL在 render 阶段计算派生状态，而非在 useEffect 中同步。

#### Scenario: 表单初始值派生
- **GIVEN** FeedSettingsModal 接收 `feed` prop
- **WHEN** 组件渲染
- **THEN** 表单初始值在 render 中直接从 `feed` 派生
- **AND** 不使用 useEffect 同步 state

#### Scenario: 列表数据派生
- **GIVEN** ItemList 需要根据 filters 过滤 items
- **WHEN** 组件渲染
- **THEN** 过滤逻辑使用 `useMemo` 缓存
- **AND** 仅在 items 或 filters 变化时重新计算
