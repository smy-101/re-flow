## Context

re-flow 是一个 RSS 阅读器应用，当前技术栈为 Next.js 16 + React 19 + Drizzle ORM + SQLite。本设计旨在引入 AI 配置管理功能，使用户能够配置和管理多个 AI 提供商，为后续的 RSS 内容 AI 处理功能奠定基础。

**当前状态**：
- 应用仅有 RSS 订阅和阅读功能
- 数据库已有 users、feeds、feed_items、categories 表
- 认证使用 JWT + HTTP-only cookie

**约束**：
- API Key 必须加密存储
- 兼容 OpenAI 和 Anthropic 两种 API 格式
- 支持预置供应商和自定义供应商

## Goals / Non-Goals

**Goals:**
- 实现 AI 配置的完整 CRUD 操作
- 支持 OpenAI、Anthropic 及其兼容格式的第三方供应商
- 提供 API Key 加密存储机制
- 实现配置测试功能以验证配置可用性
- 实现默认配置和启用/禁用状态管理
- 实现健康状态追踪机制

**Non-Goals:**
- 不实现 AI 实际调用处理 RSS 内容的功能（后续迭代）
- 不实现配置的导入/导出功能
- 不实现配置的团队共享功能
- 不实现用量统计和配额管理

## Decisions

### 1. 加密方案选择：AES-256-GCM

**决定**：使用 AES-256-GCM 加密 API Key

**理由**：
- GCM 模式提供认证加密，防止密文被篡改
- Node.js crypto 模块原生支持，无需额外依赖
- 256 位密钥强度足够，符合安全最佳实践

**备选方案**：
- AES-256-CBC：需要额外的 HMAC 做认证，更复杂
- sodium-native：需要编译原生模块，增加部署复杂度

### 2. AI SDK 选择：Vercel AI SDK

**决定**：使用 Vercel AI SDK 作为 AI 调用抽象层

**理由**：
- 统一的 API 接口，屏蔽 OpenAI 和 Anthropic 的差异
- 支持 OpenAI 兼容格式（通过 baseURL 配置）
- 与 Next.js 生态集成良好
- 社区活跃，文档完善

**备选方案**：
- 直接调用各供应商 API：代码重复，维护成本高
- LangChain：过于重量级，功能超出需求

### 3. 供应商适配策略：格式优先

**决定**：使用 `apiFormat` 字段区分 OpenAI/Anthropic 格式，而非 `providerType`

**理由**：
- 许多第三方供应商兼容 OpenAI 格式（DeepSeek、通义千问等）
- 实际调用时只需关心 API 格式，不需要知道具体供应商
- 简化代码逻辑，一个适配器处理所有兼容供应商

### 4. 健康状态设计

**决定**：使用三态健康状态（unverified/active/error）

**理由**：
- `unverified`：区分新建/编辑后未测试的配置
- `active`：测试成功，配置可用
- `error`：测试或调用失败，记录错误信息

**状态流转**：
```
创建 → unverified → 测试 → active/error
编辑 → unverified（重置）
```

### 5. 数据库表设计

**决定**：使用单表 `ai_configs` 存储所有配置

**字段设计**：
- `provider_type`：供应商类型（openai/anthropic/openai-compatible/anthropic-compatible/custom）
- `provider_id`：预置供应商 ID（可选）
- `api_format`：实际使用的 API 格式（openai/anthropic）
- `api_key_encrypted/iv/tag`：加密后的 API Key 及相关参数
- `model_params`：JSON 存储模型参数
- `health_status`：健康状态
- `is_default/is_enabled`：默认配置和启用状态

## Risks / Trade-offs

### 风险：API Key 泄露
- **风险**：加密密钥泄露导致所有 API Key 不安全
- **缓解**：ENCRYPTION_KEY 通过环境变量管理，不提交到代码库；生产环境使用密钥管理服务

### 风险：供应商 API 变更
- **风险**：第三方供应商 API 变更导致兼容性问题
- **缓解**：优先支持官方 API；第三方兼容问题通过配置测试快速发现

### 权衡：单表 vs 多表
- **选择**：单表存储所有配置
- **权衡**：简化查询逻辑，但 `model_params` 使用 JSON 存储，无法做字段级约束
- **接受理由**：模型参数可选且结构灵活，JSON 存储更实用

### 权衡：前端状态管理
- **选择**：使用 React 状态 + SWR（与现有模式一致）
- **权衡**：不引入全局状态管理库
- **接受理由**：配置管理是页面级功能，不需要跨页面状态共享

## Component Tree

```
app/(dashboard)/settings/ai/page.tsx (Server Component)
└── AIConfigList (Client Component)
    ├── AIConfigCard (Client Component) × N
    │   ├── HealthStatusBadge
    │   ├── Switch (启用/禁用)
    │   └── DropdownMenu (操作菜单)
    └── AIConfigModal (Client Component)
        └── AIConfigForm (Client Component)
            ├── ProviderSelector
            ├── ModelInput
            ├── Textarea (系统提示词)
            └── ModelParamsSection (可折叠)
                ├── Slider (Temperature)
                ├── Input (Max Tokens)
                └── ExtraParamsInput
```

## API Routes

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/ai-configs` | GET | 获取配置列表（默认配置优先） |
| `/api/ai-configs` | POST | 创建配置 |
| `/api/ai-configs/[id]` | GET | 获取配置详情 |
| `/api/ai-configs/[id]` | PUT | 更新配置（重置健康状态） |
| `/api/ai-configs/[id]` | DELETE | 删除配置 |
| `/api/ai-configs/[id]/test` | POST | 测试配置（更新健康状态） |
| `/api/ai-configs/[id]/set-default` | PUT | 设置为默认配置 |
| `/api/ai-configs/[id]/toggle` | PUT | 切换启用状态 |
| `/api/ai-configs/presets` | GET | 获取预置供应商列表 |
| `/api/ai-configs/test-direct` | POST | 直接测试配置（保存前） |

## File Changes

### 新增文件

| 文件 | 说明 |
|------|------|
| `lib/auth/encryption.ts` | 加密/解密工具函数 |
| `lib/ai/providers.ts` | AI 提供商配置和适配器 |
| `lib/ai/test.ts` | AI 配置测试功能 |
| `lib/api/ai-configs.ts` | 前端 API 客户端 |
| `app/api/ai-configs/route.ts` | 列表和创建 API |
| `app/api/ai-configs/[id]/route.ts` | 详情、更新、删除 API |
| `app/api/ai-configs/[id]/test/route.ts` | 测试 API |
| `app/api/ai-configs/[id]/set-default/route.ts` | 设置默认 API |
| `app/api/ai-configs/[id]/toggle/route.ts` | 切换状态 API |
| `app/api/ai-configs/presets/route.ts` | 预置供应商 API |
| `app/api/ai-configs/test-direct/route.ts` | 直接测试 API |
| `components/ai/AIConfigList.tsx` | 配置列表组件 |
| `components/ai/AIConfigCard.tsx` | 配置卡片组件 |
| `components/ai/AIConfigForm.tsx` | 配置表单组件 |
| `components/ai/AIConfigModal.tsx` | 编辑模态框 |
| `components/ai/ProviderSelector.tsx` | 供应商选择器 |
| `components/ai/ModelInput.tsx` | 模型输入组件 |
| `components/ai/ModelParamsSection.tsx` | 模型参数区域 |
| `components/ai/ExtraParamsInput.tsx` | 额外参数输入 |
| `components/ai/HealthStatusBadge.tsx` | 健康状态徽章 |
| `components/ai/TestConfigButton.tsx` | 测试按钮 |
| `app/(dashboard)/settings/ai/page.tsx` | AI 设置页面 |

### 修改文件

| 文件 | 修改内容 |
|------|---------|
| `lib/db/schema.ts` | 添加 `aiConfigs` 表定义 |
| `lib/config/navigation.ts` | 添加 AI 设置导航项 |
