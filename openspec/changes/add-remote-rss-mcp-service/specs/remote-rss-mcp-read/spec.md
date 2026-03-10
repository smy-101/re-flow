## ADDED Requirements

### Requirement: MCP 提供最近文章组合视图列表
系统 SHALL 通过远程 HTTP/SSE MCP 工具返回用户授权范围内的最近文章组合视图列表。

#### Scenario: 返回最近文章列表
- **GIVEN** MCP 客户端携带合法 bearer token 发起读取请求
- **WHEN** 请求最近文章组合视图列表
- **THEN** 系统按 `publishedAt` 倒序返回文章组合视图
- **AND** 默认返回 20 条记录
- **AND** 单次请求数量不得超过 50 条

#### Scenario: 请求只能收缩授权范围
- **GIVEN** token 已定义 feed 白名单和时间窗口上限
- **WHEN** 客户端附带更小的 feed 范围或更短的时间窗口请求数据
- **THEN** 系统仅返回收缩后的授权结果
- **AND** 不允许请求突破 token 定义的上限

### Requirement: MCP 返回文章组合视图
系统 SHALL 以文章为聚合锚点返回可直接消费的组合视图，而不是直接暴露处理记录列表。

#### Scenario: 存在成功处理结果
- **GIVEN** 某文章存在一个或多个成功处理结果
- **WHEN** 系统构建文章组合视图
- **THEN** 系统选择最新成功结果作为首选 processed 内容
- **AND** 返回结构化字段标记该视图来自 processed 内容

#### Scenario: 不存在可用处理结果
- **GIVEN** 某文章没有成功处理结果
- **WHEN** token 允许 raw fallback
- **THEN** 系统返回按字符数裁剪的有限原文内容
- **AND** 返回结构化字段标记这是 raw fallback

#### Scenario: processing 为 pending 或 error
- **GIVEN** 某文章最近一次处理状态为 `pending` 或 `error`
- **WHEN** 系统构建文章组合视图
- **THEN** 系统同时返回结构化处理状态和有限原文回退内容
- **AND** 返回抽象错误类型与 `retryable` 字段
- **AND** 返回最近一次处理尝试时间

### Requirement: MCP 提供单篇文章组合视图详情
系统 SHALL 提供单篇文章组合视图详情工具，用于获取某篇文章的完整聚合结果。

#### Scenario: 获取单篇文章详情
- **GIVEN** MCP 客户端已获得某篇文章的稳定标识
- **WHEN** 客户端请求单篇文章组合视图详情
- **THEN** 系统返回该文章的组合视图详情
- **AND** 返回内容仍受 token 的 feed 白名单、时间窗口和 raw fallback 配置约束

#### Scenario: 文章超出授权范围
- **GIVEN** 某文章不在 token 的授权范围内
- **WHEN** 客户端请求该文章详情
- **THEN** 系统拒绝返回该文章内容
- **AND** 不泄露超出授权范围的数据
