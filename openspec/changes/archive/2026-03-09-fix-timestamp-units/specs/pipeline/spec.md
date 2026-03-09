## ADDED Requirements

### Requirement: 管道时间戳一致性

系统 SHALL 以 Unix 秒级时间戳持久化并返回管道的 `createdAt` 与 `updatedAt`，且管道列表必须按相同语义展示这些字段。

#### Scenario: 创建管道写入秒级时间
- **GIVEN** 用户提交有效的管道创建请求
- **WHEN** 系统创建管道
- **THEN** `createdAt` 与 `updatedAt` MUST 为秒级时间戳
- **AND** 管道卡片中的创建时间显示为真实当前日期

#### Scenario: 编辑管道保持秒级时间
- **GIVEN** 用户编辑已有管道
- **WHEN** 系统保存更新结果
- **THEN** `updatedAt` MUST 以秒级时间戳写入并返回
- **AND** 不得向数据库写入毫秒级时间值

## MODIFIED Requirements

### Requirement: 管道列表展示

系统 SHALL 为已登录用户展示其所有管道列表。

#### Scenario: 展示管道列表
- **GIVEN** 用户访问管道设置页面 `/settings/pipelines`
- **WHEN** 系统加载当前用户的所有管道
- **THEN** 系统展示当前用户的所有管道
- **AND** 每个管道以卡片形式展示
- **AND** 卡片显示管道名称、描述、包含的步骤数量
- **AND** 卡片中的创建时间必须与管道的真实创建日期一致

#### Scenario: 空状态提示
- **GIVEN** 用户没有任何管道
- **WHEN** 用户访问管道设置页面 `/settings/pipelines`
- **THEN** 系统展示空状态提示
- **AND** 提供"创建管道"入口
