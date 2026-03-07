# Feed 自动处理配置

## Purpose

允许用户为每个 RSS 订阅预配置处理管道或模板，实现新文章自动处理。

## ADDED Requirements

### Requirement: 配置订阅自动处理

系统 SHALL 允许用户为 RSS 订阅配置自动处理设置。

#### Scenario: 启用自动处理
- **WHEN** 用户在订阅设置页启用"自动处理"开关
- **THEN** 系统将 `auto_process` 字段设为 `true`

#### Scenario: 选择处理类型
- **WHEN** 用户选择处理类型为"管道"
- **THEN** 系统显示用户的所有管道列表
- **AND** 用户可选择一个管道
- **AND** 系统保存 `pipeline_id`

#### Scenario: 选择模板类型
- **WHEN** 用户选择处理类型为"单个模板"
- **THEN** 系统显示用户的所有工艺模板列表
- **AND** 用户可选择一个模板
- **AND** 系统保存 `template_id`

#### Scenario: 管道与模板互斥
- **WHEN** 用户选择了管道
- **THEN** 系统清除已选的模板（`template_id` 设为 `null`）
- **AND** 反之亦然

#### Scenario: 禁用自动处理
- **WHEN** 用户关闭"自动处理"开关
- **THEN** 系统将 `auto_process` 设为 `false`
- **AND** 保留 `pipeline_id` 和 `template_id` 配置（下次启用时使用）

---

### Requirement: 数据库约束

系统 SHALL 确保管道和模板配置的完整性。

#### Scenario: 有效管道引用
- **WHEN** 用户配置 `pipeline_id`
- **THEN** 系统验证该管道存在且属于当前用户

#### Scenario: 有效模板引用
- **WHEN** 用户配置 `template_id`
- **THEN** 系统验证该模板存在且属于当前用户

#### Scenario: 删除管道时检查
- **WHEN** 管道被删除
- **THEN** 系统将引用该管道的订阅的 `pipeline_id` 设为 `null`
- **AND** `auto_process` 自动设为 `false`

#### Scenario: 删除模板时检查
- **WHEN** 模板被删除
- **THEN** 系统将引用该模板的订阅的 `template_id` 设为 `null`
- **AND** `auto_process` 自动设为 `false`
