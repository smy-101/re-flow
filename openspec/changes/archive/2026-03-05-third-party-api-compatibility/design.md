## Context

当前 `lib/ai/providers.ts` 使用 Vercel AI SDK 的 `@ai-sdk/openai` 创建模型。默认调用方式 `provider(model, settings)` 会使用 OpenAI 的 Responses API (`/v1/responses`)，这是 OpenAI 的新一代 API。

但许多第三方 AI 供应商（DeepSeek、通义千问、智谱、月之暗面等）仅实现了标准的 Chat Completions API (`/v1/chat/completions`)，不支持 Responses API，导致这些供应商的配置测试失败。

Vercel AI SDK 的 `OpenAIProvider` 接口提供多种模型创建方法：
- `provider(modelId)` 或 `.responses(modelId)` → 使用 `/v1/responses`
- `.chat(modelId)` → 使用 `/v1/chat/completions`
- `.completion(modelId)` → 使用 `/v1/completions`（旧版）

## Goals / Non-Goals

**Goals:**
- 官方 OpenAI 供应商使用 Responses API（享受最新功能）
- 所有 OpenAI 格式的第三方供应商使用 Chat Completions API（保证兼容性）
- 保持代码简洁，无需引入新的配置选项

**Non-Goals:**
- 不增加用户配置选项（自动选择 API 格式）
- 不支持 `/v1/completions` 旧版 API
- 不修改数据库 schema
- 不修改 API 接口

## Decisions

### 1. 根据 providerType 选择 API 调用方式

**决定**：在 `createModelFromConfig` 函数中，根据 `providerType` 判断使用哪种模型创建方法。

**理由**：
- `providerType` 已在现有配置中，无需新增字段
- 官方供应商明确，可以安全地区分
- 对用户完全透明，无需额外配置

**映射规则**：

| ProviderType | API Format | Model Creation Method | API Endpoint |
|--------------|-------------|---------------------|---------------|
| `openai` | `openai` | `provider()` 或 `.responses()` | `/v1/responses` |
| `openai-compatible` | `openai` | `.chat()` | `/v1/chat/completions` |
| `custom` | `openai` | `.chat()` | `/v1/chat/completions` |
| `anthropic` | `anthropic` | `provider()` | `/v1/messages` |
| `anthropic-compatible` | `anthropic` | `provider()` | `/v1/messages` |

### 2. Anthropic 供应商保持不变

**决定**：Anthropic 相关供应商不区分官方与兼容模式，统一使用默认调用方式。

**理由**：
- Anthropic API 目前只有单一接口 (`/v1/messages`)
- 用户反馈的兼容性问题集中在 OpenAI 格式
- 简化实现，避免过度设计

### 3. 不新增配置选项

**决定**：不添加 `apiEndpoint` 或类似配置项，完全自动处理。

**理由**：
- 用户不需要了解底层 API 差异
- 减少配置复杂度
- 降低出错可能

**备选方案（未采纳）**：
- 添加 `apiEndpoint: 'responses' | 'chat' | 'auto'` 配置项
  - 增加用户认知负担
  - 大多数用户不了解两种 API 的区别
  - 配置错误会导致问题难以排查

## Risks / Trade-offs

### [Risk] 未来官方 OpenAI 可能完全废弃 Chat Completions API

**影响**：如果 OpenAI 完全移除 `/v1/chat/completions`，第三方供应商将无法跟随 OpenAI 官方演进。

**缓解**：
- 当前 OpenAI 仍维护 Chat Completions API
- 第三方供应商通常会适配 OpenAI 官方 API
- 如需切换，可通过更新预设配置实现

### [Risk] 某些第三方供应商可能已实现 Responses API

**影响**：强制使用 Chat Completions 可能导致这些供应商无法使用最新功能。

**缓解**：
- 目前主流第三方供应商（DeepSeek、通义、智谱等）均未实现 Responses API
- 可通过添加 `extraParams` 允许高级用户手动配置
- 未来可添加 `apiEndpoint` 配置项支持高级场景

### [Trade-off] 代码复杂度略增

**影响**：需要增加条件判断逻辑。

**缓解**：
- 逻辑清晰，易于维护
- 仅涉及单个函数修改
- 测试覆盖简单
