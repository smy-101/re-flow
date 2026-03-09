## ADDED Requirements

### Requirement: AI 配置时间戳一致性

系统 SHALL 以 Unix 秒级时间戳持久化并返回 AI 配置的 `createdAt`、`updatedAt` 与 `lastErrorAt`，且相关页面必须按相同语义展示这些字段。

#### Scenario: 创建配置写入秒级时间
- **GIVEN** 用户提交有效的 AI 配置创建请求
- **WHEN** 系统创建新配置
- **THEN** `createdAt` 与 `updatedAt` MUST 为秒级时间戳
- **AND** 配置列表中的创建时间显示为真实当前日期而非异常未来日期

#### Scenario: 更新配置保持秒级时间
- **GIVEN** 用户编辑已有 AI 配置
- **WHEN** 系统保存更新结果
- **THEN** `updatedAt` MUST 以秒级时间戳写入并返回
- **AND** 健康状态重置时不得引入毫秒级时间值

#### Scenario: 测试失败记录错误时间
- **GIVEN** 用户测试 AI 配置且测试失败
- **WHEN** 系统写入错误状态
- **THEN** `lastErrorAt` MUST 为秒级时间戳
- **AND** 错误时间在配置卡片中显示为正确的本地日期

## MODIFIED Requirements

### Requirement: AI 配置列表展示

系统 SHALL 为已登录用户展示其所有 AI 配置列表。

#### Scenario: 展示配置列表
- **GIVEN** 用户访问 AI 设置页面 `/settings/ai`
- **WHEN** 系统加载当前用户的 AI 配置
- **THEN** 系统展示当前用户的所有 AI 配置
- **AND** 默认配置排在列表最前面
- **AND** 每个配置以卡片形式展示
- **AND** 卡片中的创建时间必须与配置的真实创建日期一致

#### Scenario: 空状态提示
- **GIVEN** 用户没有任何 AI 配置
- **WHEN** 用户访问 AI 设置页面 `/settings/ai`
- **THEN** 系统展示空状态提示
- **AND** 提供"添加配置"入口
