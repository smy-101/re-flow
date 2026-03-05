## ADDED Requirements

### Requirement: 预置供应商支持

系统 SHALL 提供预置的 AI 供应商配置模板。

#### Scenario: 获取预置供应商列表
- **WHEN** 用户请求预置供应商列表
- **THEN** 系统返回所有预置供应商配置
- **AND** 每个供应商包含：ID、名称、API 格式、默认 Base URL、常用模型列表

#### Scenario: 预置供应商包含
- **WHEN** 系统返回预置供应商列表
- **THEN** 列表包含以下供应商：
  - OpenAI（官方）
  - Anthropic（官方）
  - DeepSeek
  - 通义千问（Qwen）
  - 智谱 AI（GLM）
  - 月之暗面（Moonshot）
  - 自定义

---

### Requirement: OpenAI 格式适配

系统 SHALL 支持使用 OpenAI API 格式的供应商。

#### Scenario: 使用 OpenAI 官方
- **WHEN** 用户选择 OpenAI 供应商
- **THEN** 系统使用 `@ai-sdk/openai` 创建模型
- **AND** 默认 Base URL 为 `https://api.openai.com/v1`

#### Scenario: 使用 OpenAI 兼容供应商
- **WHEN** 用户选择 OpenAI 兼容的第三方供应商
- **THEN** 系统使用 `@ai-sdk/openai` 创建模型
- **AND** 配置自定义的 Base URL

#### Scenario: OpenAI 格式模型参数
- **WHEN** 用户配置 OpenAI 格式的模型参数
- **THEN** 系统支持以下参数：
  - Temperature（0-2）
  - Max Tokens（正整数）
  - Top P（0-1）
  - Frequency Penalty（-2 到 2）
  - Presence Penalty（-2 到 2）

---

### Requirement: Anthropic 格式适配

系统 SHALL 支持使用 Anthropic API 格式的供应商。

#### Scenario: 使用 Anthropic 官方
- **WHEN** 用户选择 Anthropic 供应商
- **THEN** 系统使用 `@ai-sdk/anthropic` 创建模型
- **AND** 默认 Base URL 为 `https://api.anthropic.com/v1`

#### Scenario: 使用 Anthropic 兼容供应商
- **WHEN** 用户选择 Anthropic 兼容的第三方供应商
- **THEN** 系统使用 `@ai-sdk/anthropic` 创建模型
- **AND** 配置自定义的 Base URL

#### Scenario: Anthropic 格式模型参数
- **WHEN** 用户配置 Anthropic 格式的模型参数
- **THEN** 系统支持以下参数：
  - Temperature（0-1）
  - Max Tokens（1-4096）
  - Top P（0-1）

---

### Requirement: 自定义供应商

系统 SHALL 允许用户配置自定义的 AI 供应商。

#### Scenario: 创建自定义供应商
- **WHEN** 用户选择"自定义"供应商类型
- **THEN** 系统显示 API 格式选择（OpenAI 格式 / Anthropic 格式）
- **AND** 用户必须手动输入 API 地址

#### Scenario: 自定义供应商验证
- **WHEN** 用户提交自定义供应商配置
- **AND** 未选择 API 格式
- **THEN** 系统返回验证错误"必须选择 API 格式"

---

### Requirement: 供应商选择联动

系统 SHALL 根据供应商选择自动填充配置。

#### Scenario: 选择预置供应商
- **WHEN** 用户选择一个预置供应商
- **THEN** 系统自动填充该供应商的默认 Base URL
- **AND** 显示该供应商的常用模型列表作为提示

#### Scenario: 修改自动填充值
- **WHEN** 用户选择预置供应商后
- **AND** 用户修改了自动填充的 Base URL
- **THEN** 系统接受用户的修改值

---

### Requirement: 系统提示词配置

系统 SHALL 允许用户为 AI 配置设置系统提示词。

#### Scenario: 设置系统提示词
- **WHEN** 用户在配置表单中输入系统提示词
- **THEN** 系统保存该提示词到配置中

#### Scenario: 系统提示词可选
- **WHEN** 用户不输入系统提示词
- **THEN** 系统正常创建配置
- **AND** 系统提示词字段为空

---

### Requirement: 额外模型参数

系统 SHALL 允许用户配置额外的模型参数。

#### Scenario: 添加额外参数
- **WHEN** 用户在"额外参数"区域添加键值对
- **THEN** 系统保存这些参数到配置中

#### Scenario: 删除额外参数
- **WHEN** 用户删除某个额外参数
- **THEN** 系统从配置中移除该参数

#### Scenario: 额外参数格式
- **WHEN** 用户保存额外参数
- **THEN** 参数以 JSON 对象格式存储
