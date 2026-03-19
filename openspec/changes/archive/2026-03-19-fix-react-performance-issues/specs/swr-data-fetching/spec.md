## Purpose

定义使用 SWR 进行客户端数据获取、缓存和去重的规范，确保请求数据一致性和性能优化。

## ADDED Requirements

### Requirement: SWR 数据获取 Hook
系统SHALL提供基于 SWR 的数据获取 hooks，实现自动请求去重、缓存和后台重新验证。

#### Scenario: Feeds 数据获取
- **WHEN** 组件调用 `useFeeds()` hook
- **THEN** 系统返回 `{ data, error, isLoading, mutate }` 对象
- **AND** 相同 key 的并发请求自动去重
- **AND** 数据在后台自动重新验证

#### Scenario: Items 数据获取
- **WHEN** 组件调用 `useItems(filters)` hook
- **THEN** 系统根据 filters 生成唯一 SWR key
- **AND** 返回过滤后的 items 数据
- **AND** 支持分页和排序参数

#### Scenario: 单个资源获取
- **WHEN** 组件调用 `useFeed(id)` 或 `useItem(id)` hook
- **THEN** 系统在 id 存在时发起请求
- **AND** id 为 null/undefined 时不发起请求

### Requirement: Mutation 操作
系统SHALL使用 `useSWRMutation` 处理创建、更新、删除操作，并在成功后自动重新验证相关缓存。

#### Scenario: 创建资源后刷新列表
- **WHEN** 用户创建新的 feed
- **THEN** 系统调用 mutation 函数
- **AND** 成功后自动重新验证 feeds 列表缓存
- **AND** 用户看到新数据无需手动刷新

#### Scenario: 删除资源后更新列表
- **WHEN** 用户删除 feed
- **THEN** 系统调用 delete mutation
- **AND** 成功后从缓存中移除该 feed
- **AND** 使用乐观更新立即反映 UI 变化

### Requirement: 全局 SWR 配置
系统SHALL在应用根布局提供 `SWRConfig`，配置全局 revalidation 策略。

#### Scenario: 配置重新验证间隔
- **WHEN** 应用初始化
- **THEN** 系统配置 `dedupingInterval: 5000`（5 秒内不重复请求）
- **AND** 配置 `revalidateOnFocus: false`
- **AND** 配置 `revalidateOnReconnect: true`

#### Scenario: 错误重试配置
- **WHEN** 请求失败
- **THEN** 系统最多重试 2 次
- **AND** 重试间隔使用指数退避
