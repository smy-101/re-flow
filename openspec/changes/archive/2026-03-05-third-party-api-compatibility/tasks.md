## 1. 核心实现

- [x] 1.1 修改 lib/ai/providers.ts 中的 createModelFromConfig 函数，添加根据 providerType 选择 API 调用方式的逻辑

## 2. 测试

- [x] 2.1 在 __tests__/lib/ai/providers.test.ts 添加测试用例，验证官方 OpenAI 使用 Responses API
- [x] 2.2 在 __tests__/lib/ai/providers.test.ts 添加测试用例，验证 OpenAI 兼容供应商使用 Chat Completions API
- [x] 2.3 在 __tests__/lib/ai/providers.test.ts 添加测试用例，验证自定义供应商使用 Chat Completions API
- [x] 2.4 运行 pnpm test __tests__/lib/ai/ 并确认全部通过

## 3. 类型检查

- [x] 3.1 运行 pnpm exec tsc --noEmit 确认零类型错误
