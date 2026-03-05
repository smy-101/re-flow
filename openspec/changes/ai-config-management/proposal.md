## Why

re-flow 当前仅支持 RSS 订阅和阅读功能，缺乏 AI 处理能力。用户在阅读大量 RSS 内容时，需要手动筛选和消化信息，效率较低。通过引入 AI 配置管理功能，用户可以配置多个 AI 提供商，为后续的智能摘要、翻译、分类等功能奠定基础。

## What Changes

- **新增 AI 配置管理模块**：支持创建、编辑、删除、查看 AI 配置
- **多提供商支持**：支持 OpenAI、Anthropic 官方及兼容格式的第三方供应商（DeepSeek、通义千问、智谱 AI、月之暗面等）
- **配置测试功能**：保存前后均可测试配置是否可用
- **默认配置机制**：用户可设置一个默认配置供全局使用
- **启用/禁用状态**：支持临时禁用配置而不删除
- **健康状态追踪**：追踪配置的可用性状态（未验证/健康/异常）
- **安全存储**：API Key 使用 AES-256-GCM 加密存储
- **模型参数配置**：支持 Temperature、Max Tokens 等参数自定义

## Capabilities

### New Capabilities

- `ai-config`: AI 配置的完整生命周期管理（CRUD、测试、默认配置、启用/禁用、健康状态）
- `ai-provider`: AI 提供商抽象层（预置供应商模板、自定义供应商、OpenAI/Anthropic 格式适配）
- `api-key-encryption`: API Key 加密存储（AES-256-GCM）

### Modified Capabilities

- `navigation`: 侧边栏新增「AI 设置」导航项

## Impact

**新增文件**：
- `lib/auth/encryption.ts` - 加密工具
- `lib/ai/providers.ts` - 提供商适配
- `lib/ai/test.ts` - 配置测试
- `lib/api/ai-configs.ts` - 前端 API 客户端
- `app/api/ai-configs/*` - API 路由（9 个端点）
- `components/ai/*` - UI 组件（10+ 个组件）
- `app/(dashboard)/settings/ai/page.tsx` - 设置页面

**修改文件**：
- `lib/db/schema.ts` - 新增 `aiConfigs` 表
- `lib/config/navigation.ts` - 新增导航项

**新增依赖**：
- `ai` - Vercel AI SDK
- `@ai-sdk/openai` - OpenAI 适配
- `@ai-sdk/anthropic` - Anthropic 适配

**新增环境变量**：
- `ENCRYPTION_KEY` - 加密密钥（64 字符十六进制）
