## 1. 新增模块

- [ ] 1.1 创建 `lib/digest/refresher.ts`：实现 `refreshFeedsForDigest()` 函数，根据过滤规则刷新相关 RSS 源
- [ ] 1.2 创建 `lib/digest/ai-processor.ts`：实现 `processArticlesForDigest()` 函数，同步执行 AI 处理

## 2. 测试用例（TDD: Red）

- [ ] 2.1 编写 `__tests__/lib/digest/refresher.test.ts` 失败用例：测试按过滤规则刷新 RSS 源
- [ ] 2.2 编写 `__tests__/lib/digest/ai-processor.test.ts` 失败用例：测试同步 AI 处理逻辑
- [ ] 2.3 运行 `pnpm test __tests__/lib/digest/` 并确认新用例先失败（Red）

## 3. 核心实现

- [ ] 3.1 实现 `lib/digest/refresher.ts` 功能使测试通过（Green）
- [ ] 3.2 实现 `lib/digest/ai-processor.ts` 功能使测试通过（Green）
- [ ] 3.3 修改 `lib/digest/worker.ts`：在 `processDigestConfig()` 中集成 RSS 刷新和 AI 处理流程
- [ ] 3.4 更新 `workers/digest-worker.ts`：确保正确加载环境变量和启动合并后的 worker

## 4. 清理旧代码

- [ ] 4.1 删除 `workers/rss-worker.ts`
- [ ] 4.2 删除 `workers/processing-worker.ts`
- [ ] 4.3 更新 `package.json`：移除 `worker:rss` 和 `worker:processing` 脚本

## 5. 验证

- [ ] 5.1 运行 `pnpm test __tests__/lib/digest/` 并确认全部通过（Green）
- [ ] 5.2 手工验证：启动 `pnpm worker:digest`，确认 worker 正常运行
- [ ] 5.3 手工验证：创建摘要配置，等待触发，确认邮件发送前会刷新 RSS 并执行 AI 处理
- [ ] 5.4 手工验证：通过 `/api/feeds/[id]/refresh` 手动刷新，确认功能正常

## 6. 代码质量

- [ ] 6.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [ ] 6.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
