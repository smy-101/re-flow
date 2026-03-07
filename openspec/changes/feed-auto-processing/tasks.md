## 1. 数据库迁移

- [ ] 1.1 在 `lib/db/schema.ts` 中为 `feeds` 表新增字段：`pipeline_id`、`template_id`、`auto_process`
- [ ] 1.2 在 `lib/db/schema.ts` 中新增 `processing_queue` 表定义及类型导出
- [ ] 1.3 运行 `pnpm exec drizzle-kit generate` 生成迁移文件
- [ ] 1.4 运行 `pnpm exec drizzle-kit migrate` 应用迁移

## 2. 队列管理模块（TDD）

- [ ] 2.1 创建 `__tests__/lib/processing/` 目录结构
- [ ] 2.2 编写 `__tests__/lib/processing/queue.test.ts` 失败用例（Red）：入队、状态查询、失败重试
- [ ] 2.3 运行 `pnpm test __tests__/lib/processing/queue.test.ts` 并确认新用例先失败（Red）
- [ ] 2.4 创建 `lib/processing/queue.ts` 实现 `addToQueue`、`getQueueStatus`、`getNextPendingJob`、`markJobProcessing`、`markJobDone`、`markJobError`
- [ ] 2.5 运行 `pnpm test __tests__/lib/processing/queue.test.ts` 并确认全部通过（Green）

## 3. RSS Fetcher 集成（TDD）

- [ ] 3.1 扩展 `__tests__/lib/rss/fetcher.test.ts` 失败用例（Red）：自动入队逻辑
- [ ] 3.2 运行 `pnpm test __tests__/lib/rss/fetcher.test.ts` 并确认新用例先失败（Red）
- [ ] 3.3 修改 `lib/rss/fetcher.ts` 的 `storeItems()` 函数：检查 feed 配置并自动入队
- [ ] 3.4 运行 `pnpm test __tests__/lib/rss/fetcher.test.ts` 并确认全部通过（Green）

## 4. Processing Worker

- [ ] 4.1 创建 `workers/processing-worker.ts`：轮询队列、执行处理、存储结果
- [ ] 4.2 实现错误处理与重试逻辑（指数退避）
- [ ] 4.3 实现优雅启动与关闭逻辑
- [ ] 4.4 在 `package.json` 中添加 `worker:processing` 脚本

## 5. 队列状态 API（TDD）

- [ ] 5.1 创建 `app/api/queue/status/route.ts`：GET 接口返回队列状态
- [ ] 5.2 编写 `__tests__/lib/api/queue.test.ts` 失败用例（Red）：状态查询
- [ ] 5.3 创建 `lib/api/queue.ts`：前端 API 调用封装
- [ ] 5.4 运行 `pnpm test __tests__/lib/api/queue.test.ts` 并确认全部通过（Green）

## 6. Feed API 扩展

- [ ] 6.1 修改 `app/api/feeds/route.ts`：创建/列表接口返回新字段
- [ ] 6.2 修改 `app/api/feeds/[id]/route.ts`：更新/获取接口支持新字段
- [ ] 6.3 添加配置验证逻辑（管道模板互斥、自动处理需要配置）
- [ ] 6.4 修改 `lib/api/feeds.ts`：更新类型定义和请求参数

## 7. Feed 设置页面 UI

- [ ] 7.1 编写手工测试用例 Feed 设置页面：Given 订阅存在 / When 用户配置自动处理 / Then 配置保存成功
- [ ] 7.2 修改 Feed 编辑页面：新增"自动处理"配置区块（开关、类型选择、下拉选择器）
- [ ] 7.3 手工验证 Feed 设置页面：启用自动处理、选择管道/模板、保存配置

## 8. 文章详情页队列状态

- [ ] 8.1 编写手工测试用例 文章详情页：Given 文章在队列中 / When 页面加载 / Then 显示实时状态
- [ ] 8.2 创建 `hooks/useQueueStatus.ts`：轮询队列状态 Hook（5秒间隔）
- [ ] 8.3 修改 `components/processing/ProcessingHistory.tsx`：显示队列状态（pending/processing/done/error）
- [ ] 8.4 添加"重试"按钮支持失败任务重试
- [ ] 8.5 手工验证 文章详情页：排队中、处理中、完成、失败各状态显示

## 9. 代码质量检查

- [ ] 9.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [ ] 9.2 运行 `pnpm test __tests__/lib/processing/ __tests__/lib/rss/fetcher.test.ts __tests__/lib/api/queue.test.ts` 并确认全部通过
- [ ] 9.3 运行 `pnpm exec tsc --noEmit` 确认零类型错误
