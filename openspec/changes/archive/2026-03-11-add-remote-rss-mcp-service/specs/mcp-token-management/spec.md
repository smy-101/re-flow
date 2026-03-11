## ADDED Requirements

### Requirement: 用户创建 MCP Token
系统 SHALL 允许已登录用户在独立 MCP 设置页面中以一步式流程创建 MCP client token。

#### Scenario: 成功创建 token
- **GIVEN** 用户已登录并进入 MCP 设置页面
- **WHEN** 用户填写名称、选择 feed 白名单、时间窗口和 raw fallback 配置后提交创建
- **THEN** 系统创建新的 token 记录并生成 secret
- **AND** 仅在创建成功后展示一次 secret
- **AND** 页面提供强提醒保存与复制按钮

#### Scenario: 创建后不再回显 secret
- **GIVEN** 用户已经完成 token 创建
- **WHEN** 用户重新进入列表页或详情页
- **THEN** 系统不返回完整 secret
- **AND** 仅返回用户可理解的元数据与权限详情

### Requirement: 用户管理 MCP Token 状态
系统 SHALL 允许已登录用户启用、禁用和删除自己创建的 MCP token。

#### Scenario: 禁用 token
- **GIVEN** 用户拥有一个启用中的 token
- **WHEN** 用户执行禁用操作
- **THEN** 系统将该 token 标记为禁用
- **AND** 后续使用该 token 的 MCP 请求被拒绝

#### Scenario: 启用 token
- **GIVEN** 用户拥有一个已禁用的 token
- **WHEN** 用户执行启用操作
- **THEN** 系统将该 token 恢复为启用状态
- **AND** token 可再次用于合法 MCP 请求

#### Scenario: 删除 token
- **GIVEN** 用户拥有一个 token
- **WHEN** 用户执行删除操作
- **THEN** 系统永久移除该 token
- **AND** 该 token 不再可用于任何 MCP 请求

### Requirement: 用户查看 Token 列表与详情
系统 SHALL 提供 MCP token 的列表视图和详情视图，并只展示用户可理解且会操作的字段。

#### Scenario: 查看列表
- **GIVEN** 用户已创建一个或多个 token
- **WHEN** 用户打开 MCP token 列表页
- **THEN** 系统显示名称、创建时间、最近使用时间和状态
- **AND** 不在列表中展示完整 secret

#### Scenario: 查看详情
- **GIVEN** 用户拥有一个 token
- **WHEN** 用户打开该 token 的详情页
- **THEN** 系统显示名称、状态、创建时间、最近使用时间
- **AND** 显示 feed 白名单、时间窗口和 raw fallback 配置
- **AND** 不展示完整 secret
