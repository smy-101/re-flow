## Why

部分第三方 AI 供应商 API 仅实现了 `/v1/chat/completions` 端点，不支持 OpenAI 新的 `/v1/responses` API。当前实现统一使用默认调用方式，导致第三方供应商测试失败。需要在官方供应商和第三方供应商之间采用不同的 API 调用策略。

## What Changes

- 修改 `lib/ai/providers.ts` 中的 `createModelFromConfig` 函数
- 根据 `providerType` 区分 API 调用方式：
  - 官方 OpenAI：使用默认调用（Responses API）
  - OpenAI 兼容供应商（`openai-compatible`、`custom`）：使用 `.chat()` 方法（Chat Completions API）
  - Anthropic 相关供应商：保持现有逻辑
- 不需要修改数据库 schema 或 API 接口

## Capabilities

### Modified Capabilities

- `ai-provider`: 新增第三方供应商 API 兼容模式要求，区分官方与兼容供应商的 API 调用方式

## Impact

- `lib/ai/providers.ts`: `createModelFromConfig` 函数逻辑调整
- 影响所有 OpenAI 格式的第三方供应商配置（DeepSeek、通义千问、智谱、月之暗面、自定义）
- 测试功能 `lib/ai/test.ts` 不受影响（使用相同的模型创建方式）
