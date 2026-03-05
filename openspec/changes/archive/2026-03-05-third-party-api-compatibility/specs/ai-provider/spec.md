## MODIFIED Requirements

### Requirement: OpenAI 格式适配

系统 SHALL 支持使用 OpenAI API 格式的供应商，并根据供应商类型选择兼容的 API 端点。

#### Scenario: 使用 OpenAI 官方
- **WHEN** 用户选择 OpenAI 供应商（providerType 为 `openai`）
- **THEN** 系统使用 `@ai-sdk/openai` 创建模型
- **AND** 使用默认调用方式或 `.responses()` 方法（Responses API）
- **AND** 默认 Base URL 为 `https://api.openai.com/v1`

#### Scenario: 使用 OpenAI 兼容供应商
- **WHEN** 用户选择 OpenAI 兼容的第三方供应商（providerType 为 `openai-compatible` 或 `custom`）
- **THEN** 系统使用 `@ai-sdk/openai` 创建模型
- **AND** 使用 `.chat()` 方法（Chat Completions API）
- **AND** 配置自定义的 Base URL

#### Scenario: OpenAI 格式模型参数
- **WHEN** 用户配置 OpenAI 格式的模型参数
- **THEN** 系统支持以下参数：
  - Temperature（0-2）
  - Max Tokens（正整数）
  - Top P（0-1）
  - Frequency Penalty（-2 到 2）
  - Presence Penalty（-2 到 2）
