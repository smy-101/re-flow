# AI 配置管理功能 - 需求规格说明书

## 1. 项目概述

### 1.1 背景与目标
re-flow 是一个 RSS 阅读器应用，用户订阅和管理多个 RSS 源。本功能旨在为应用添加 AI 处理能力，允许用户：
- 配置多个 AI 提供商（官方 OpenAI、Anthropic，以及兼容格式的第三方供应商）
- 为 RSS 内容使用 AI 进行处理（摘要、翻译、分类等）
- 灵活管理多个 AI 配置，支持自定义参数

**支持的供应商**：
- 官方供应商：OpenAI、Anthropic
- OpenAI 兼容格式：DeepSeek、通义千问、智谱 AI、月之暗面等
- Anthropic 兼容格式：支持 Anthropic 协议的第三方服务
- 自定义：用户可配置任意兼容 OpenAI 或 Anthropic 格式的服务

### 1.2 技术选型
- **AI SDK**: Vercel AI SDK (ai, @ai-sdk/openai, @ai-sdk/anthropic)
- **数据库**: Drizzle ORM + SQLite
- **前端框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS 4
- **认证**: JWT + HTTP-only cookie（复用现有机制）

---

## 2. 功能需求

### 2.1 核心功能列表

| 功能模块 | 功能点 | 优先级 |
|---------|--------|--------|
| AI 配置管理 | 配置列表展示 | P0 |
| AI 配置管理 | 创建配置 | P0 |
| AI 配置管理 | 编辑配置 | P0 |
| AI 配置管理 | 删除配置 | P0 |
| AI 配置管理 | 配置测试 | P0 |
| AI 配置管理 | 默认配置 | P0 |
| AI 配置管理 | 启用/禁用状态 | P0 |
| AI 配置管理 | 配置健康状态 | P0 |
| 提供商支持 | OpenAI 官方 | P0 |
| 提供商支持 | Anthropic 官方 | P0 |
| 提供商支持 | OpenAI 兼容格式（第三方） | P0 |
| 提供商支持 | Anthropic 兼容格式（第三方） | P0 |
| 提供商支持 | 预置供应商模板 | P1 |
| 提供商支持 | 自定义供应商 | P1 |
| 参数配置 | 系统提示词 | P0 |
| 参数配置 | 模型参数自定义 | P0 |
| 参数配置 | 额外模型参数 | P1 |
| 安全 | API Key 加密存储 | P0 |
| 状态管理 | 健康状态追踪 | P0 |
| 状态管理 | 错误信息记录 | P0 |

### 2.2 功能详细描述

#### 2.2.1 AI 配置列表
- 展示当前用户的所有 AI 配置
- 卡片式布局，每张卡片显示：
  - 配置名称
  - 提供商类型（图标/标签）
  - 模型名称
  - 系统提示词摘要（如有）
  - 创建时间
- 空状态提示和添加配置入口
- 支持编辑和删除操作

#### 2.2.2 创建/编辑 AI 配置
**基本信息表单字段**：
- 配置名称（必填，字符串，3-50 字符）
- 供应商选择（下拉选择，支持预置供应商和自定义）
  - 预置选项：OpenAI、Anthropic、DeepSeek、通义千问、智谱 AI、月之暗面等
  - 自定义选项：用户手动输入
- API 格式（当选择自定义时显示，下拉选择：OpenAI 格式 / Anthropic 格式）
- API 地址（根据选择自动填充预置值，用户可修改）
- API Key（必填，加密存储）
- 模型名称（必填，提供常用模型提示）
- 系统提示词（可选，多行文本）

**预置供应商配置**：

| 供应商 | API 格式 | 默认 Base URL | 常用模型 |
|--------|---------|--------------|---------|
| OpenAI | OpenAI | https://api.openai.com/v1 | gpt-4o, gpt-4o-mini, gpt-3.5-turbo |
| Anthropic | Anthropic | https://api.anthropic.com/v1 | claude-3-5-sonnet, claude-3-5-haiku |
| DeepSeek | OpenAI | https://api.deepseek.com/v1 | deepseek-chat, deepseek-coder |
| 通义千问 | OpenAI | https://dashscope.aliyuncs.com/compatible-mode/v1 | qwen-turbo, qwen-plus, qwen-max |
| 智谱 AI | OpenAI | https://open.bigmodel.cn/api/paas/v4 | glm-4, glm-4-flash, glm-4-plus |
| 月之暗面 | OpenAI | https://api.moonshot.cn/v1 | moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k |
| 自定义 | 用户指定 | 用户填写 | 用户填写 |

**模型参数表单（可折叠）**：
- **OpenAI 格式参数**：
  - Temperature（数值，0-2，默认 0.7）
  - Max Tokens（数值，正整数，默认无限制）
  - Top P（数值，0-1，默认 1）
  - Frequency Penalty（数值，-2 到 2，默认 0）
  - Presence Penalty（数值，-2 到 2，默认 0）
- **Anthropic 格式参数**：
  - Temperature（数值，0-1，默认 0.7）
  - Max Tokens（数值，1-4096，默认 1024）
  - Top P（数值，0-1，默认 1）

**验证规则**：
- 配置名称：不能为空，长度 3-50
- API Key：不能为空
- 模型名称：不能为空
- API 地址：必须是有效的 HTTP/HTTPS URL
- 模型参数：数值范围验证
- 自定义供应商：必须选择 API 格式

#### 2.2.3 删除 AI 配置
- 需要确认对话框
- 删除前检查配置是否被其他功能引用（预留）
- 删除成功后显示提示消息

#### 2.2.4 配置测试
- 使用简单测试 prompt 验证配置是否可用
- 测试 prompt：`"Hello, please respond with 'OK' if you can understand this message."`
- 成功：显示"配置可用"提示，更新健康状态为 `active`
- 失败：显示具体错误信息，更新健康状态为 `error` 并记录错误信息

#### 2.2.5 默认配置
- 用户可将任意启用的配置设为默认
- 每个用户最多只能有一个默认配置
- 设置新默认配置时，自动取消原默认配置的默认标记
- 默认配置不是必须的，用户可以没有默认配置
- 默认配置在列表中优先显示，带有星标标识

#### 2.2.6 启用/禁用状态
- 每个配置都有启用/禁用状态
- 新创建的配置默认为启用状态
- 禁用的配置仍可进行测试和编辑操作
- 配置卡片上显示启用/禁用开关

#### 2.2.7 健康状态管理
- 每个配置有三种健康状态：
  - `unverified`：未验证（新建或编辑后的初始状态）
  - `active`：健康（测试成功或调用成功）
  - `error`：异常（测试失败或调用失败）
- 编辑配置后自动重置为 `unverified` 状态，并清除错误信息
- 配置卡片上显示状态指示器
- 异常状态时显示最后错误信息和错误时间

#### 2.2.8 健康状态流转图

```
                    创建
                      │
                      ▼
               ┌─────────────┐
               │ unverified  │ ◀──────────────┐
               └──────┬──────┘                │
                      │                       │
               测试成功                编辑配置
                      │                       │
                      ▼                       │
               ┌─────────────┐                │
          ┌────│   active    │────────────────┤
          │    └─────────────┘                │
          │                                   │
     测试失败                           测试失败
          │                                   │
          ▼                                   │
   ┌─────────────┐                            │
   │   error     │ ───── 测试成功 ────────────┘
   └─────────────┘
```

---

## 3. 技术方案

### 3.1 数据库设计

#### 3.1.1 ai_configs 表结构

```sql
CREATE TABLE ai_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL,        -- 'openai' | 'anthropic' | 'openai-compatible' | 'anthropic-compatible' | 'custom'
  provider_id TEXT,                   -- 预置供应商 ID，如 'deepseek', 'qwen'
  api_format TEXT NOT NULL,           -- 'openai' | 'anthropic' - 实际使用的 API 格式
  base_url TEXT NOT NULL,             -- API 地址（第三方供应商必填）
  api_key_encrypted TEXT NOT NULL,
  api_key_iv TEXT NOT NULL,
  api_key_tag TEXT NOT NULL,
  model TEXT NOT NULL,
  system_prompt TEXT,
  model_params TEXT,                  -- JSON 字符串存储参数
  is_default INTEGER NOT NULL DEFAULT 0,  -- 是否为默认配置
  is_enabled INTEGER NOT NULL DEFAULT 1,  -- 是否启用
  health_status TEXT NOT NULL DEFAULT 'unverified',  -- 健康状态: 'unverified' | 'active' | 'error'
  last_error TEXT,                    -- 最后错误信息
  last_error_at INTEGER,              -- 最后错误时间戳
  extra_params TEXT,                  -- 额外模型参数 (JSON)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX ai_configs_user_id_idx ON ai_configs(user_id);
```

#### 3.1.2 字段说明

| 字段 | 类型 | 说明 | 验证规则 |
|------|------|------|---------|
| id | INTEGER | 主键 | - |
| user_id | INTEGER | 用户外键 | NOT NULL |
| name | TEXT | 配置名称 | 3-50 字符 |
| provider_type | TEXT | 提供商类型 | 'openai', 'anthropic', 'openai-compatible', 'anthropic-compatible', 'custom' |
| provider_id | TEXT | 预置供应商 ID | 如 'deepseek', 'qwen'，可为 NULL |
| api_format | TEXT | API 格式 | 'openai' or 'anthropic' |
| base_url | TEXT | API 地址 | 有效 URL |
| api_key_encrypted | TEXT | 加密的 API Key | NOT NULL |
| api_key_iv | TEXT | 加密 IV | NOT NULL |
| api_key_tag | TEXT | 加密认证标签 | NOT NULL |
| model | TEXT | 模型名称 | NOT NULL |
| system_prompt | TEXT | 系统提示词 | 可选 |
| model_params | TEXT | 模型参数（JSON） | 可选，有效 JSON |
| is_default | INTEGER | 是否为默认配置 | 0 或 1，默认 0 |
| is_enabled | INTEGER | 是否启用 | 0 或 1，默认 1 |
| health_status | TEXT | 健康状态 | 'unverified', 'active', 'error'，默认 'unverified' |
| last_error | TEXT | 最后错误信息 | 可选 |
| last_error_at | INTEGER | 最后错误时间戳 | 可选，Unix epoch |
| extra_params | TEXT | 额外模型参数（JSON） | 可选，有效 JSON |
| created_at | INTEGER | 创建时间戳 | Unix epoch |
| updated_at | INTEGER | 更新时间戳 | Unix epoch |

### 3.2 加密方案

#### 3.2.1 算法选择
- **算法**: AES-256-GCM
- **密钥长度**: 256 位（32 字节）
- **IV 长度**: 16 字节
- **认证标签**: 16 字节

#### 3.2.2 实现位置
创建新文件：`lib/auth/encryption.ts`

```typescript
export function encrypt(text: string): { encrypted: string; iv: string; tag: string }
export function decrypt(encrypted: string, iv: string, tag: string): string
```

#### 3.2.3 环境变量
```env
ENCRYPTION_KEY=<64字符的十六进制字符串>
```

生成密钥命令：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 AI SDK 集成

#### 3.3.1 提供商适配
创建新文件：`lib/ai/providers.ts`

```typescript
// 预置供应商配置
export interface PresetProvider {
  id: string;
  name: string;
  type: ProviderType;
  apiFormat: ApiFormat;
  defaultBaseURL: string;
  defaultModels?: string[];
}

export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'openai-compatible'
  | 'anthropic-compatible'
  | 'custom';

export type ApiFormat = 'openai' | 'anthropic';

export const PRESET_PROVIDERS: PresetProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI (官方)',
    type: 'openai',
    apiFormat: 'openai',
    defaultBaseURL: 'https://api.openai.com/v1',
    defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo']
  },
  {
    id: 'anthropic',
    name: 'Anthropic (官方)',
    type: 'anthropic',
    apiFormat: 'anthropic',
    defaultBaseURL: 'https://api.anthropic.com/v1',
    defaultModels: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://api.deepseek.com/v1',
    defaultModels: ['deepseek-chat', 'deepseek-coder']
  },
  {
    id: 'qwen',
    name: '通义千问 (Qwen)',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModels: ['qwen-turbo', 'qwen-plus', 'qwen-max']
  },
  {
    id: 'zhipu',
    name: '智谱 AI (GLM)',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModels: ['glm-4', 'glm-4-flash', 'glm-4-plus']
  },
  {
    id: 'moonshot',
    name: '月之暗面 (Moonshot)',
    type: 'openai-compatible',
    apiFormat: 'openai',
    defaultBaseURL: 'https://api.moonshot.cn/v1',
    defaultModels: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
  },
  {
    id: 'custom',
    name: '自定义',
    type: 'custom',
    apiFormat: 'openai',
    defaultBaseURL: '',
    defaultModels: []
  }
];

// AI 配置接口
export interface AIConfig {
  id: number;
  providerType: ProviderType;
  providerId?: string;
  apiFormat: ApiFormat;
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
  modelParams?: Record<string, any>;
}

// 根据配置创建 AI 模型
export function createModelFromConfig(config: AIConfig): LanguageModel
```

#### 3.3.2 测试功能
创建新文件：`lib/ai/test.ts`

```typescript
export async function testAIConfig(config: AIConfig): Promise<TestResult>

export interface TestResult {
  success: boolean;
  error?: string;
  latency?: number; // 毫秒
  // 可选的额外信息
  provider?: string;
  model?: string;
}

// 测试提示词根据 API 格式自动选择
const TEST_PROMPTS = {
  openai: "Hello, please respond with 'OK' if you can understand this message.",
  anthropic: "Hello. Please respond with 'OK' if you understand this message."
};
```

#### 3.3.3 健康状态更新逻辑

```typescript
// 测试成功时更新配置状态
async function handleTestSuccess(configId: number): Promise<void> {
  await db.update(aiConfigs)
    .set({
      healthStatus: 'active',
      lastError: null,
      lastErrorAt: null,
      updatedAt: Date.now()
    })
    .where(eq(aiConfigs.id, configId));
}

// 测试失败时更新配置状态
async function handleTestError(configId: number, error: Error): Promise<void> {
  await db.update(aiConfigs)
    .set({
      healthStatus: 'error',
      lastError: error.message,
      lastErrorAt: Date.now(),
      updatedAt: Date.now()
    })
    .where(eq(aiConfigs.id, configId));
}

// 编辑配置时重置状态
async function handleConfigUpdate(configId: number): Promise<void> {
  await db.update(aiConfigs)
    .set({
      healthStatus: 'unverified',
      lastError: null,
      lastErrorAt: null,
      updatedAt: Date.now()
    })
    .where(eq(aiConfigs.id, configId));
}

### 3.4 API 路由设计

| 路由 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/ai-configs` | GET | 获取配置列表（默认配置优先排序） | 需认证 |
| `/api/ai-configs` | POST | 创建配置 | 需认证 |
| `/api/ai-configs/[id]` | GET | 获取配置详情 | 需认证 |
| `/api/ai-configs/[id]` | PUT | 更新配置（重置健康状态） | 需认证 |
| `/api/ai-configs/[id]` | DELETE | 删除配置 | 需认证 |
| `/api/ai-configs/[id]/test` | POST | 测试配置（更新健康状态） | 需认证 |
| `/api/ai-configs/[id]/set-default` | PUT | 设置为默认配置 | 需认证 |
| `/api/ai-configs/[id]/toggle` | PUT | 切换启用/禁用状态 | 需认证 |
| `/api/ai-configs/presets` | GET | 获取预置供应商列表 | 需认证 |
| `/api/ai-configs/test-direct` | POST | 直接测试配置（保存前） | 需认证 |

#### 3.4.1 API 响应格式

**成功响应（列表）**:
```json
{
  "configs": [
    {
      "id": 1,
      "name": "我的 GPT-4",
      "providerType": "openai",
      "providerId": "openai",
      "apiFormat": "openai",
      "baseURL": "https://api.openai.com/v1",
      "apiKey": "sk-xxxx...xxxx",
      "model": "gpt-4o",
      "systemPrompt": "你是一个专业的摘要助手...",
      "modelParams": { "temperature": 0.7 },
      "isDefault": true,
      "isEnabled": true,
      "healthStatus": "active",
      "lastError": null,
      "lastErrorAt": null,
      "extraParams": null,
      "createdAt": 1709251200,
      "updatedAt": 1709251200
    },
    {
      "id": 2,
      "name": "DeepSeek",
      "providerType": "openai-compatible",
      "providerId": "deepseek",
      "apiFormat": "openai",
      "baseURL": "https://api.deepseek.com/v1",
      "apiKey": "sk-xxxx...xxxx",
      "model": "deepseek-chat",
      "isDefault": false,
      "isEnabled": true,
      "healthStatus": "active",
      "createdAt": 1709251200,
      "updatedAt": 1709251200
    }
  ]
}
```

**成功响应（创建）**:
```json
{
  "id": 1,
  "name": "我的 GPT-4",
  ...
}
```

**错误响应**:
```json
{
  "error": "错误消息（中文）"
}
```

### 3.5 前端 API 客户端

创建新文件：`lib/api/ai-configs.ts`

```typescript
// Type definitions
export type ProviderType =
  | 'openai'
  | 'anthropic'
  | 'openai-compatible'
  | 'anthropic-compatible'
  | 'custom';

export type ApiFormat = 'openai' | 'anthropic';

export type HealthStatus = 'unverified' | 'active' | 'error';

export interface PresetProvider {
  id: string;
  name: string;
  type: ProviderType;
  apiFormat: ApiFormat;
  defaultBaseURL: string;
  defaultModels?: string[];
}

export const PRESET_PROVIDERS: PresetProvider[] = [
  // 同 providers.ts 中的定义
];

export interface AIConfig {
  id: number;
  name: string;
  providerType: ProviderType;
  providerId?: string;
  apiFormat: ApiFormat;
  baseURL: string;
  apiKey: string; // 掩码显示
  model: string;
  systemPrompt?: string;
  modelParams?: ModelParams;
  isDefault: boolean;
  isEnabled: boolean;
  healthStatus: HealthStatus;
  lastError?: string;
  lastErrorAt?: number;
  extraParams?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface CreateAIConfigInput {
  name: string;
  providerType: ProviderType;
  providerId?: string;
  apiFormat: ApiFormat;
  baseURL: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
  modelParams?: ModelParams;
  isDefault?: boolean;
  extraParams?: Record<string, unknown>;
}

export interface UpdateAIConfigInput {
  name?: string;
  providerType?: ProviderType;
  providerId?: string;
  apiFormat?: ApiFormat;
  baseURL?: string;
  apiKey?: string;
  model?: string;
  systemPrompt?: string;
  modelParams?: ModelParams;
  isEnabled?: boolean;
  extraParams?: Record<string, unknown>;
}

export interface ModelParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface TestResult {
  success: boolean;
  error?: string;
  latency?: number; // 毫秒
}

// API functions
export async function getAIConfigs(): Promise<AIConfig[]>
export async function createAIConfig(data: CreateAIConfigInput): Promise<AIConfig>
export async function updateAIConfig(id: number, data: UpdateAIConfigInput): Promise<AIConfig>
export async function deleteAIConfig(id: number): Promise<void>
export async function testAIConfig(id: number): Promise<TestResult>
export async function testAIConfigDirect(config: CreateAIConfigInput): Promise<TestResult> // 创建前测试
export async function setDefaultConfig(id: number): Promise<void> // 设置为默认配置
export async function toggleConfigEnabled(id: number): Promise<AIConfig> // 切换启用状态
```

---

## 4. UI 设计

### 4.1 页面结构

```
/(dashboard)/settings/ai/page.tsx  (新增)
```

### 4.2 组件结构

```
components/ai/                    (新增)
├── AIConfigList.tsx            # 配置列表组件
├── AIConfigCard.tsx            # 单个配置卡片
├── AIConfigModal.tsx           # 创建/编辑模态框
├── AIConfigForm.tsx            # 配置表单
├── ProviderSelector.tsx        # 供应商选择下拉
├── ModelInput.tsx              # 模型输入（带预设模型提示）
├── ModelParamsSection.tsx      # 模型参数折叠区域
├── ExtraParamsInput.tsx        # 额外参数输入组件（新增）
├── HealthStatusBadge.tsx       # 健康状态徽章组件（新增）
└── TestConfigButton.tsx        # 测试按钮组件
```

### 4.3 页面布局

```
+-------------------------------------------------+
| DashboardNavbar (固定顶部)                        |
+-------------------------------------------------+
| +---------+  +-----------------------------------+ |
| |         |  |                                   | |
| | Sidebar|  |  AI Configs                       | |
| |         |  |                                   | |
| |         |  |  +---------------------------+      | |
| |         |  |  | [添加配置] [搜索/筛选] |      | |
| |         |  |  +---------------------------+      | |
| |         |  |                                   | |
| |         |  |  [配置卡片 1] [配置卡片 2]       | |
| |         |  |                                   | |
| |         |  |  [配置卡片 3] [配置卡片 4]       | |
| +---------+  |                                   | |
|             +-----------------------------------+ |
+-------------------------------------------------+
```

### 4.4 配置卡片设计

```
+----------------------------------------------+
| ⭐ 我的 GPT-4              [启用 ✓]  [⋮]    |  ← 默认配置有星标
| ------------------------------------------   |
|                                       |      |
|  [OpenAI]                              |     |
|  Model: gpt-4o                          |     |
|  Created: 2025-01-15  ● 健康            |     |  ← 状态指示器
|                                       |      |
|  [🧪 测试] [✏️ 编辑] [设为默认]          |     |
+----------------------------------------------+

+----------------------------------------------+
| DeepSeek                   [启用 ✓]  [⋮]    |
| ------------------------------------------   |
|                                       |      |
|  [DeepSeek]                            |     |
|  Model: deepseek-chat                    |   |
|  Created: 2025-01-15  ● 健康             |   |
|                                       |      |
|  [🧪 测试] [✏️ 编辑] [设为默认]          |     |
+----------------------------------------------+

+----------------------------------------------+
| 备用配置                   [禁用]  ⚠️  [⋮]  |  ← 禁用状态
| ------------------------------------------   |
|                                       |      |
|  [Anthropic]                           |     |
|  Model: claude-3-5-sonnet  ● 异常       |     |  ← 错误状态
| 最后错误: API Key 无效 (2025-03-05)     |     |
|                                       |      |
|  [🧪 测试] [✏️ 编辑] [设为默认]          |     |
+----------------------------------------------+
```

**健康状态指示器**：
- `● 健康` (绿色) - healthStatus: 'active'
- `● 未验证` (灰色) - healthStatus: 'unverified'
- `● 异常` (红色) - healthStatus: 'error'

### 4.5 配置表单设计

```
+----------------------------------------------+
| AI 配置设置                          [×]     |
| ------------------------------------------   |
|                                       |   |
|  配置名称 *                              |   |
|  [我的 GPT-4________________________]     |   |
|                                       |   |
|  供应商 *                               |   |
|  [OpenAI (官方)                  ▼]       |   |
|  ┌──────────────────────────────────┐     |   |
|  │ OpenAI (官方)                    │     |   |
|  │ Anthropic (官方)                 │     |   |
|  │ DeepSeek                         │     |   |
|  │ 通义千问 (Qwen)                  │     |   |
|  │ 智谱 AI (GLM)                    │     |   |
|  │ 月之暗面 (Moonshot)              │     |   |
|  │ 自定义...                        │     |   |
|  └──────────────────────────────────┘     |   |
|                                       |   |
|  API 兼容格式 * (选择"自定义"时显示)      |   |
|  [OpenAI 格式                      ▼]       |   |
|                                       |   |
|  API 地址 *                            |   |
|  [https://api.openai.com/v1________]     |   |
|  (根据选择自动填充，可修改)                |   |
|                                       |   |
|  API Key *                              |   |
|  [sk-...                              ]     |   |
|                                       |   |
|  模型名称 *                              |   |
|  [gpt-4o____________________________]     |   |
|  [点击加载常用模型 ▼]                    |   |
|                                       |   |
|  系统提示词                              |   |
|  [你是一个专业的 RSS 摘要助手...   ]     |   |
|  [............................]            |   |
|                                       |   |
|  [展开模型参数 ▼]                        |   |
|                                       |   |
|  [取消]              [保存]            |   |
+----------------------------------------------+
```

### 4.6 模型参数区域（展开后）

**OpenAI 格式参数**：
```
+----------------------------------------------+
| 模型参数                              [▲]    |
| ------------------------------------------   |
|                                       |      |
|  Temperature                            |     |
|  [0.7]  ●━━━━━━●━━━━━━━━● 2.0         |     |
|  (控制输出的随机性)                       |    |
|                                       |      |
|  Max Tokens                             |     |
|  [4096__________________________]         |  |
|  (最大输出 token 数)                      |    |
|                                       |      |
|  Top P                                 |     |
|  [1.0]  ●━━━━━━━━━━━━━━● 1.0          |     |
|  (核采样概率)                           |     |
|                                       |      |
|  Frequency Penalty                       |   |
|  [0.0]  ●━━●━━━━━━━━━━━━━━● 2.0        |    |
|  (减少重复内容的惩罚)                     |    |
|                                       |      |
|  Presence Penalty                        |   |
|  [0.0]  ●━━●━━━━━━━━━━━━━━● 2.0        |    |
|  (鼓励新话题的惩罚)                       |    |
|                                       |      |
|  额外参数 (高级)                          |   |
|  +─────────────────+─────────────────+     |
|  │ Key             │ Value           │ [×] │
|  +─────────────────+─────────────────+     |
|  │ reasoning_effort│ medium          │ [×] │
|  +─────────────────+─────────────────+     |
|  │ [ + 添加参数 ]                           │  |
+----------------------------------------------+
```

**Anthropic 格式参数**：
```
+----------------------------------------------+
| 模型参数                              [▲]    |
| ------------------------------------------   |
|                                       |      |
|  Temperature                            |     |
|  [0.7]  ●━━━━━━●━━━━━━● 1.0          |      |
|  (控制输出的随机性)                       |    |
|                                       |      |
|  Max Tokens                             |     |
|  [1024_________________________]         |  |
|  (最大输出 token 数，最大 4096)             |  |
|                                       |      |
|  Top P                                 |     |
|  [1.0]  ●━━━━━━━━━━━━━━● 1.0         |      |
|  (核采样概率)                           |     |
|                                       |      |
|  额外参数 (高级)                          |   |
|  +─────────────────+─────────────────+     |
|  │ Key             │ Value           │ [×] │
|  +─────────────────+─────────────────+     |
|  │ [ + 添加参数 ]                           │  |
+----------------------------------------------+
```

### 4.7 侧边栏更新

在 `lib/config/navigation.ts` 中添加新的导航项：

```typescript
{
  name: 'AI 设置',
  href: '/settings/ai',
  icon: SettingsIcon, // 或 BrainIcon, CpuIcon 等
  disabled: false
}
```

---

## 5. 安全考虑

### 5.1 API Key 保护

1. **加密存储**: 使用 AES-256-GCM 加密后存储到数据库
2. **传输安全**: 所有 API 调用使用 HTTPS
3. **响应过滤**: 返回给前端的 API Key 仅显示掩码（sk-xxxx...xxxx）
4. **环境变量**: 加密密钥通过环境变量管理，不硬编码

### 5.2 访问控制

1. **用户隔离**: 配置通过 user_id 关联，用户只能访问自己的配置
2. **认证验证**: 所有 API 端点需要有效的 JWT token
3. **所有权检查**: 修改/删除操作验证用户是否拥有该配置

### 5.3 输入验证

1. **字段验证**: 所有输入字段进行类型和长度验证
2. **URL 验证**: API 地址必须是有效的 HTTP/HTTPS URL
3. **JSON 验证**: model_params 必须是有效的 JSON
4. **注入防护**: 防止 SQL 注入和 XSS 攻击（使用 Drizzle ORM）

---

## 6. 错误处理

### 6.1 错误类型与处理

| 错误类型 | HTTP 状态码 | 用户提示 |
|---------|-------------|---------|
| 认证失败 | 401 | 请先登录 |
| 无权限访问 | 403 | 您没有权限访问此配置 |
| 配置不存在 | 404 | 配置不存在 |
| 无效输入 | 400 | 输入格式错误 |
| API 调用失败 | 500 | AI 服务调用失败，请检查配置 |
| 网络超时 | 504 | 请求超时，请稍后重试 |
| 测试失败 | 400 | 配置测试失败：{具体错误} |
| API Key 无效 | 400 | API Key 无效，请检查配置 |
| 模型不存在 | 400 | 指定的模型不存在，请检查模型名称 |
| 供应商不支持 | 400 | 该供应商暂不支持此功能 |
| 配额超限 | 429 | API 调用次数超限，请稍后重试或升级配额 |

### 6.2 用户反馈

1. **Toast 通知**: 操作成功/失败时显示临时通知
2. **表单错误**: 字段级错误提示
3. **加载状态**: 异步操作显示加载指示器

---

## 7. 测试计划

### 7.1 单元测试

**测试文件**: `__tests__/lib/ai/`

| 测试用例 | 描述 |
|---------|------|
| `encryption.test.ts` | 测试加密/解密功能 |
| `providers.test.ts` | 测试提供商创建功能 |
| `test.test.ts` | 测试配置测试功能 |

### 7.2 API 测试

**测试文件**: `__tests__/app/api/ai-configs/`

| 测试用例 | 描述 |
|---------|------|
| GET /api/ai-configs | 获取配置列表 |
| POST /api/ai-configs | 创建新配置 |
| GET /api/ai-configs/:id | 获取单个配置 |
| PUT /api/ai-configs/:id | 更新配置 |
| DELETE /api/ai-configs/:id | 删除配置 |
| POST /api/ai-configs/:id/test | 测试配置 |
| PUT /api/ai-configs/:id/set-default | 设置默认配置 |
| PUT /api/ai-configs/:id/toggle | 切换启用状态 |
| 访问控制测试 | 验证用户隔离和权限 |
| 输入验证测试 | 验证无效输入的处理 |

### 7.3 集成测试

| 测试场景 | 描述 |
|---------|------|
| 创建配置 → 列表显示 | 验证配置创建后正确显示 |
| 编辑配置 → 数据更新 | 验证编辑后数据正确保存 |
| 删除配置 → 列表移除 | 验证删除后配置从列表移除 |
| 测试有效配置 | 验证配置测试成功 |
| 测试无效配置 | 验证无效配置返回正确错误 |
| API Key 脱敏显示 | 验证 API Key 不被完整显示 |
| 预置供应商创建 | 验证使用预置供应商时自动填充参数 |
| 自定义供应商创建 | 验证自定义供应商配置正确保存 |
| OpenAI 格式兼容测试 | 验证 OpenAI 兼容格式的第三方服务可用 |
| Anthropic 格式兼容测试 | 验证 Anthropic 兼容格式的第三方服务可用 |
| 不同参数组合测试 | 验证不同供应商的参数配置正确传递 |
| 默认配置设置 | 验证设置默认配置时其他配置的默认标记被清除 |
| 启用/禁用切换 | 验证配置启用/禁用状态切换正确 |
| 健康状态更新 | 验证测试成功/失败时健康状态正确更新 |
| 编辑后状态重置 | 验证编辑配置后健康状态重置为 unverified |
| 额外参数保存 | 验证额外模型参数正确保存和读取 |

---

## 8. 实现步骤

### Phase 1: 基础设施
1. 添加依赖包：`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`
2. 创建加密工具：`lib/auth/encryption.ts`
3. 配置环境变量：`ENCRYPTION_KEY`

### Phase 2: 数据库
1. 创建 schema：`lib/db/schema.ts` - 添加 `aiConfigs` 表
2. 生成迁移：`pnpm exec drizzle-kit generate`
3. 应用迁移：`pnpm exec drizzle-kit migrate`

### Phase 3: AI 集成
1. 创建预置供应商配置：`lib/ai/providers.ts`
2. 创建提供商适配：`lib/ai/providers.ts` - `createModelFromConfig`
3. 创建测试功能：`lib/ai/test.ts`

### Phase 4: API 路由
1. 创建预置供应商端点：`app/api/ai-configs/presets/route.ts`
2. 创建列表端点：`app/api/ai-configs/route.ts`
3. 创建详情端点：`app/api/ai-configs/[id]/route.ts`
4. 创建测试端点：`app/api/ai-configs/[id]/test/route.ts`
5. 创建直接测试端点：`app/api/ai-configs/test-direct/route.ts`
6. 创建设置默认端点：`app/api/ai-configs/[id]/set-default/route.ts`
7. 创建切换状态端点：`app/api/ai-configs/[id]/toggle/route.ts`

### Phase 5: API 客户端
1. 创建类型定义：`lib/api/ai-configs.ts`
2. 导入预置供应商配置
3. 实现 CRUD 函数
4. 实现测试函数（包括直接测试）

### Phase 6: UI 组件
1. 创建供应商选择器：`components/ai/ProviderSelector.tsx`
2. 创建模型输入组件：`components/ai/ModelInput.tsx`
3. 创建健康状态徽章：`components/ai/HealthStatusBadge.tsx`
4. 创建额外参数输入：`components/ai/ExtraParamsInput.tsx`
5. 创建列表组件：`components/ai/AIConfigList.tsx`
6. 创建卡片组件：`components/ai/AIConfigCard.tsx`
7. 创建表单组件：`components/ai/AIConfigForm.tsx`
8. 创建模态框组件：`components/ai/AIConfigModal.tsx`

### Phase 7: 页面
1. 创建设置页面：`app/(dashboard)/settings/ai/page.tsx`
2. 更新侧边栏配置：`lib/config/navigation.ts`

### Phase 8: 测试
1. 编写单元测试
2. 编写 API 测试
3. 验证功能完整性
4. 测试不同供应商的兼容性

---

## 9. 依赖清单

### 9.1 新增 npm 包

```json
{
  "dependencies": {
    "ai": "^6.0.116",
    "@ai-sdk/openai": "^3.0.41",
    "@ai-sdk/anthropic": "^3.0.58",
  }
}
```

### 9.2 新增环境变量

```env
ENCRYPTION_KEY=<64字符十六进制字符串>
```

---

## 10. 文件清单

### 新增文件

| 文件路径 | 类型 | 说明 |
|---------|------|------|
| `lib/auth/encryption.ts` | 工具 | 加密/解密函数 |
| `lib/ai/providers.ts` | 工具 | AI 提供商适配、预置供应商配置 |
| `lib/ai/test.ts` | 工具 | AI 配置测试 |
| `lib/api/ai-configs.ts` | API 客户端 | 前端 API 调用函数 |
| `app/api/ai-configs/route.ts` | API 路由 | 列表和创建 |
| `app/api/ai-configs/[id]/route.ts` | API 路由 | 详情、更新、删除 |
| `app/api/ai-configs/[id]/test/route.ts` | API 路由 | 测试功能 |
| `app/api/ai-configs/[id]/set-default/route.ts` | API 路由 | 设置默认配置 |
| `app/api/ai-configs/[id]/toggle/route.ts` | API 路由 | 切换启用状态 |
| `app/api/ai-configs/presets/route.ts` | API 路由 | 预置供应商列表 |
| `app/api/ai-configs/test-direct/route.ts` | API 路由 | 直接测试（保存前） |
| `components/ai/AIConfigList.tsx` | UI 组件 | 配置列表 |
| `components/ai/AIConfigCard.tsx` | UI 组件 | 配置卡片 |
| `components/ai/AIConfigForm.tsx` | UI 组件 | 配置表单 |
| `components/ai/ProviderSelector.tsx` | UI 组件 | 供应商选择器 |
| `components/ai/ModelInput.tsx` | UI 组件 | 模型输入（含预设提示） |
| `components/ai/ModelParamsSection.tsx` | UI 组件 | 模型参数 |
| `components/ai/ExtraParamsInput.tsx` | UI 组件 | 额外参数输入 |
| `components/ai/HealthStatusBadge.tsx` | UI 组件 | 健康状态徽章 |
| `components/ai/AIConfigModal.tsx` | UI 组件 | 编辑模态框 |
| `components/ai/TestConfigButton.tsx` | UI 组件 | 测试按钮 |
| `app/(dashboard)/settings/ai/page.tsx` | 页面 | AI 设置页面 |
| `__tests__/lib/ai/encryption.test.ts` | 测试 | 加密测试 |
| `__tests__/lib/ai/providers.test.ts` | 测试 | 提供商测试 |
| `__tests__/lib/ai/test.test.ts` | 测试 | 测试功能测试 |
| `__tests__/app/api/ai-configs/index.test.ts` | 测试 | API 测试 |

### 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `lib/db/schema.ts` | 添加 `aiConfigs` 表定义 |
| `lib/config/navigation.ts` | 添加 AI 设置导航项 |

---

## 11. 参考资料

### 11.1 相关文档
- Vercel AI SDK: https://sdk.vercel.ai/docs/ai-sdk-core
- Drizzle ORM: https://orm.drizzle.team/
- Next.js App Router: https://nextjs.org/docs/app

### 11.2 现有代码参考
- 认证实现: `lib/auth/auth-helper.ts`
- API 路由示例: `app/api/feeds/route.ts`
- 数据库模式: `lib/db/schema.ts`
- UI 组件: `components/feeds/FeedList.tsx`

---

*文档版本: 3.0*
*创建日期: 2025-03-05*
*最后更新: 2025-03-05*
*更新内容: 新增默认配置、启用/禁用状态、健康状态管理、额外模型参数功能*
