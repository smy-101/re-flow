# Purpose

Extend AI configuration management with deletion protection when templates are associated.

## MODIFIED Requirements

### Requirement: 删除 AI 配置

系统 SHALL 允许已登录用户删除 AI 配置。

#### Scenario: 删除配置成功
- **WHEN** 用户确认删除配置
- **AND** 配置存在且属于当前用户
- **AND** 配置没有关联的工艺模板
- **THEN** 系统删除该配置

#### Scenario: 删除确认
- **WHEN** 用户点击删除按钮
- **THEN** 系统显示确认对话框
- **AND** 用户确认后才执行删除

#### Scenario: 删除默认配置
- **WHEN** 用户删除默认配置
- **AND** 配置没有关联的工艺模板
- **THEN** 系统删除该配置
- **AND** 用户不再有默认配置

#### Scenario: 删除保护 - 存在关联模板
- **WHEN** 用户尝试删除 AI 配置
- **AND** 该配置存在关联的工艺模板
- **THEN** 系统拒绝删除
- **AND** 返回 400 错误
- **AND** 错误信息包含关联的模板名称列表
- **AND** 提示用户先删除或修改关联的模板
