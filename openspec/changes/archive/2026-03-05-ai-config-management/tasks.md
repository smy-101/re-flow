## 1. 基础设施

搭建

- [x] 1.1 安装 AI SDK 相关依赖（ai、@ai-sdk/openai、 @ai-sdk/anthropic）
- [x] 1.2 创建加密工具模块 lib/auth/encryption.ts
- [x] 1.3 配置环境变量 ENCRYPTION_KEY
- [x] 1.4 生成加密密钥（开发环境使用）
- [x] 1.5 添加 .env.example 中的 ENCRYPTION_KEY 示例

- [x] 1.6 运行类型检查 pnpm exec tsc --noEmit

- [x] 1.7 运行 lint 检查代码风格 pnpm lint

- [x] 1.8 运行测试确认基础功能可用 pnpm test

- [x] 1.9 编写加密模块单元测试 __tests__/lib/auth/encryption.test.ts
- [x] 1.10 编写 AI SDK 提供商测试 __tests__/lib/ai/providers.test.ts

- [x] 1.11 编写 AI 配置测试功能测试 __tests__/lib/ai/test.test.ts

## 2. 数据库

- [x] 2.1 添加 aiConfigs 表到 lib/db/schema.ts
- [x] 2.2 生成数据库迁移 pnpm exec drizzle-kit generate
- [x] 2.3 应用数据库迁移 pnpm exec drizzle-kit migrate
- [x] 2.4 运行类型检查 pnpm exec tsc --noEmit
- [x] 2.5 运行 lint 检查代码风格 pnpm lint
- [x] 2.6 运行测试确认迁移成功 pnpm test
- [x] 2.7 编写数据库操作测试 __tests__/lib/db/ai-configs.test.ts

## 3. 核心逻辑
- [x] 3.1 创建预置供应商配置 lib/ai/providers.ts
- [x] 3.2 实现 create模型适配函数 createModelFromConfig
- [x] 3.3 创建测试功能 lib/ai/test.ts
- [x] 3.4 创建前端 API 客户端 lib/api/ai-configs.ts
- [x] 3.5 运行类型检查 pnpm exec tsc --noEmit
- [x] 3.6 运行 lint 检查代码风格 pnpm lint
- [x] 3.7 运行测试确认核心逻辑可用 pnpm test
- [x] 3.8 编写核心逻辑单元测试（补充现有测试文件）
- [x] 3.9 编写前端 API 客户端测试 __tests__/lib/api/ai-configs.test.ts

## 4. API 路由
- [x] 4.1 创建预置供应商端点 app/api/ai-configs/presets/route.ts
- [x] 4.2 创建列表和创建端点 app/api/ai-configs/route.ts
- [x] 4.3 创建详情端点 app/api/ai-configs/[id]/route.ts
- [x] 4.4 创建测试端点 app/api/ai-configs/[id]/test/route.ts
- [x] 4.5 创建直接测试端点 app/api/ai-configs/test-direct/route.ts
- [x] 4.6 创建设置默认端点 app/api/ai-configs/[id]/set-default/route.ts
- [x] 4.7 创建切换状态端点 app/api/ai-configs/[id]/toggle/route.ts
- [x] 4.8 运行类型检查 pnpm exec tsc --noEmit
- [x] 4.9 运行 lint 检查代码风格 pnpm lint
- [x] 4.10 运行测试确认 API 路由可用 pnpm test
- [x] 4.11 编写 API 路由测试 __tests__/app/api/ai-configs/index.test.ts

## 5. UI 组件
- [x] 5.1 创建健康状态徽章组件 components/ai/HealthStatusBadge.tsx
- [x] 5.2 创建供应商选择器组件 components/ai/ProviderSelector.tsx
- [x] 5.3 创建模型输入组件 components/ai/ModelInput.tsx
- [x] 5.4 创建额外参数输入组件 components/ai/ExtraParamsInput.tsx
- [x] 5.5 创建模型参数区域组件 components/ai/ModelParamsSection.tsx
- [x] 5.6 创建配置表单组件 components/ai/AIConfigForm.tsx
- [x] 5.7 创建测试按钮组件 components/ai/TestConfigButton.tsx
- [x] 5.8 创建配置卡片组件 components/ai/AIConfigCard.tsx
- [x] 5.9 创建编辑模态框组件 components/ai/AIConfigModal.tsx
- [x] 5.10 创建配置列表组件 components/ai/AIConfigList.tsx
- [x] 5.11 运行类型检查 pnpm exec tsc --noEmit
- [x] 5.12 运行 lint 检查代码风格 pnpm lint
- [x] 5.13 运行测试确认 UI 组件可用 pnpm test
- [x] 5.14 编写 UI 组件测试 __tests__/components/ai/*.test.tsx

## 6. 页面与导航
- [x] 6.1 更新导航配置 lib/config/navigation.ts
- [x] 6.2 创建 AI 设置页面 app/(dashboard)/settings/ai/page.tsx
- [x] 6.3 运行类型检查 pnpm exec tsc --noEmit
- [x] 6.4 运行 lint 检查代码风格 pnpm lint
- [x] 6.5 运行测试确认页面可用 pnpm test
- [x] 6.6 手动测试完整功能流程

## 7. 最终验证
- [x] 7.1 运行完整类型检查 pnpm exec tsc --noEmit
- [x] 7.2 运行完整 lint 检查 pnpm lint
- [x] 7.3 运行完整测试套件 pnpm test
- [x] 7.4 手动测试完整用户流程（创建配置、测试、编辑、删除、设置默认）
