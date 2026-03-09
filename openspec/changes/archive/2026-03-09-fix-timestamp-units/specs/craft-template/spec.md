## ADDED Requirements

### Requirement: 工艺模板时间戳一致性

系统 SHALL 以 Unix 秒级时间戳持久化并返回工艺模板的 `createdAt` 与 `updatedAt`，且模板列表必须按相同语义展示这些字段。

#### Scenario: 创建模板写入秒级时间
- **GIVEN** 用户提交有效的工艺模板创建请求
- **WHEN** 系统创建模板
- **THEN** `createdAt` 与 `updatedAt` MUST 为秒级时间戳
- **AND** 模板卡片中的创建时间显示为真实当前日期

#### Scenario: 编辑模板保持秒级时间
- **GIVEN** 用户编辑已有工艺模板
- **WHEN** 系统保存更新结果
- **THEN** `updatedAt` MUST 以秒级时间戳写入并返回
- **AND** 不得向数据库写入毫秒级时间值

## MODIFIED Requirements

### Requirement: 工艺模板列表展示

系统 SHALL 为已登录用户展示其所有工艺模板列表。

#### Scenario: 展示模板列表
- **GIVEN** 用户访问工艺模板设置页面 `/settings/craft`
- **WHEN** 系统加载当前用户的工艺模板
- **THEN** 系统展示当前用户的所有工艺模板
- **AND** 每个模板以卡片形式展示
- **AND** 卡片显示模板名称、分类标签、关联的 AI 配置名称、Prompt 预览
- **AND** 卡片中的创建时间必须与模板的真实创建日期一致

#### Scenario: 空状态提示
- **GIVEN** 用户没有任何工艺模板
- **WHEN** 用户访问工艺模板设置页面 `/settings/craft`
- **THEN** 系统展示空状态提示
- **AND** 提供"创建模板"和"浏览预设模板库"入口
