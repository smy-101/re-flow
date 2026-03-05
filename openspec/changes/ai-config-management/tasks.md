## 1. 基础设施

搭建

- [ ] 1.1 安装 AI SDK 相关依赖（ai、@ai-sdk/openai、 @ai-sdk/anthropic）
- [ ] 1.2 创建加密工具模块 lib/auth/encryption.ts
- [ ] 1.3 配置环境变量 ENCRYPTION_KEY
- [ ] 1.4 生成加密密钥（开发环境使用）
- [ ] 1.5 添加 .env.example 中的 ENCRYPTION_KEY 示例

- [ ] 1.6 运行类型检查 pnpm exec tsc --noEmit

- [ ] 1.7 运行 lint 检查代码风格 pnpm lint

- [ ] 1.8 运行测试确认基础功能可用 pnpm test

- [ ] 1.9 编写加密模块单元测试 __tests__/lib/auth/encryption.test.ts
- [ ] 1.10 编写 AI SDK 提供商测试 __tests__/lib/ai/providers.test.ts

- [ ] 1.11 编写 AI 配置测试功能测试 __tests__/lib/ai/test.test.ts

## 2. 数据库

- [ ] 2.1 添加 aiConfigs 表到 lib/db/schema.ts
- [ ] 2.2 生成数据库迁移 pnpm exec drizzle-kit generate
- [ ] 2.3 应用数据库迁移 pnpm exec drizzle-kit migrate
- [ ] 2.4 运行类型检查 pnpm exec tsc --noEmit
- [ ] 2.5 运行 lint 检查代码风格 pnpm lint
- [ ] 2.6 运行测试确认迁移成功 pnpm test
- [ ] 2.7 编写数据库操作测试 __tests__/lib/db/ai-configs.test.ts

## 3. 核心逻辑
- [ ] 3.1 创建预置供应商配置 lib/ai/providers.ts
- [ ] 3.2 实现 create模型适配函数 createModelFromConfig
- [ ] 3.3 创建测试功能 lib/ai/test.ts
- [ ] 3.4 创建前端 API 客户端 lib/api/ai-configs.ts
- [ ] 3.5 运行类型检查 pnpm exec tsc --noEmit
- [ ] 3.6 运行 lint 检查代码风格 pnpm lint
- [ ] 3.7 运行测试确认核心逻辑可用 pnpm test
- [ ] 3.8 编写核心逻辑单元测试（补充现有测试文件）
- [ ] 3.9 编写前端 API 客户端测试 __tests__/lib/api/ai-configs.test.ts

## 4. API 路由
- [ ] 4.1 创建预置供应商端点 app/api/ai-configs/presets/route.ts
- [ ] 4.2 创建列表和创建端点 app/api/ai-configs/route.ts
- [ ] 4.3 创建详情端点 app/api/ai-configs/[id]/route.ts
- [ ] 4.4 创建测试端点 app/api/ai-configs/[id]/test/route.ts
- [ ] 4.5 创建直接测试端点 app/api/ai-configs/test-direct/route.ts
- [ ] 4.6 创建设置默认端点 app/api/ai-configs/[id]/set-default/route.ts
- [ ] 4.7 创建切换状态端点 app/api/ai-configs/[id]/toggle/route.ts
- [ ] 4.8 运行类型检查 pnpm exec tsc --noEmit
- [ ] 4.9 运行 lint 检查代码风格 pnpm lint
- [ ] 4.10 运行测试确认 API 路由可用 pnpm test
- [ ] 4.11 编写 API 路由测试 __tests__/app/api/ai-configs/index.test.ts

## 5. UI 组件
- [ ] 5.1 创建健康状态徽章组件 components/ai/HealthStatusBadge.tsx
- [ ] 5.2 创建供应商选择器组件 components/ai/ProviderSelector.tsx
- [ ] 5.3 创建模型输入组件 components/ai/ModelInput.tsx
- [ ] 5.4 创建额外参数输入组件 components/ai/ExtraParamsInput.tsx
- [ ] 5.5 创建模型参数区域组件 components/ai/ModelParamsSection.tsx
- [ ] 5.6 创建配置表单组件 components/ai/AIConfigForm.tsx
- [ ] 5.7 创建测试按钮组件 components/ai/TestConfigButton.tsx
- [ ] 5.8 创建配置卡片组件 components/ai/AIConfigCard.tsx
- [ ] 5.9 创建编辑模态框组件 components/ai/AIConfigModal.tsx
- [ ] 5.10 创建配置列表组件 components/ai/AIConfigList.tsx
- [ ] 5.11 运行类型检查 pnpm exec tsc --noEmit
- [ ] 5.12 运行 lint 检查代码风格 pnpm lint
- [ ] 5.13 运行测试确认 UI 组件可用 pnpm test
- [ ] 5.14 编写 UI 组件测试 __tests__/components/ai/*.test.tsx

## 6. 页面与导航
- [ ] 6.1 更新导航配置 lib/config/navigation.ts
- [ ] 6.2 创建 AI 设置页面 app/(dashboard)/settings/ai/page.tsx
- [ ] 6.3 运行类型检查 pnpm exec tsc --noEmit
- [ ] 6.4 运行 lint 检查代码风格 pnpm lint
- [ ] 6.5 运行测试确认页面可用 pnpm test
- [ ] 6.6 手动测试完整功能流程
    [ ] 6.7 编写页面测试 __tests__/app/settings/ai/page.test.tsx
## 7. 最终验证
- [ ] 7.1 运行完整类型检查 pnpm exec tsc --noEmit
- [ ] 7.2 运行完整 lint 检查 pnpm lint
- [ ] 7.3 运行完整测试套件 pnpm test
- [ ] 7.4 手动测试完整用户流程（创建配置、测试、编辑、删除、设置默认）
