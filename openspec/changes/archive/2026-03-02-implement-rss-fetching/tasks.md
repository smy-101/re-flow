## 1. Setup

- [x] 1.1 安装 node-cron 依赖 (`pnpm add node-cron && pnpm add -D @types/node-cron`)
- [x] 1.2 创建 lib/rss 目录结构
- [x] 1.3 创建 workers 目录

## 2. Core RSS Fetching Logic

- [x] 2.1 实现 lib/rss/fetcher.ts 的 parseRSS 函数（使用 rss-parser，10 秒超时）
- [x] 2.2 实现 lib/rss/fetcher.ts 的 dedupeItems 函数（基于 link 字段去重）
- [x] 2.3 实现 lib/rss/fetcher.ts 的 calculateReadingTime 函数（250 词/分钟）
- [x] 2.4 实现 lib/rss/fetcher.ts 的 storeItems 函数（事务插入 feed_items）
- [x] 2.5 实现 lib/rss/fetcher.ts 的 fetchAndStoreItems 主函数（编排上述逻辑）

## 3. API Endpoints

- [x] 3.1 创建 app/api/feeds/[id]/refresh/route.ts（POST 单个 feed 刷新）
- [x] 3.2 创建 app/api/feeds/refresh-all/route.ts（POST 批量刷新，CRON_SECRET 鉴权）
- [x] 3.3 修改 app/api/feeds/route.ts 的 POST 处理（创建后触发后台抓取）
- [x] 3.4 添加 lib/api/feeds.ts 的 refreshFeed 函数
- [x] 3.5 添加 lib/api/feeds.ts 的 refreshAllFeeds 函数

## 4. Worker Process

- [x] 4.1 创建 workers/rss-worker.ts（node-cron 调度）
- [x] 4.2 实现 processSingleFeed 函数（带 5 分钟最小间隔检查）
- [x] 4.3 实现 refreshAllFeeds 函数（顺序处理所有 feeds）
- [x] 4.4 添加 worker 启动脚本到 package.json（`worker:rss`: `tsx workers/rss-worker.ts`）
- [x] 4.5 配置日志输出（成功/失败摘要）

## 5. Frontend UI

- [x] 5.1 修改 components/feeds/FeedCard.tsx 添加刷新按钮（带 loading 和 error 状态）
- [x] 5.2 添加刷新成功/失败的 toast 提示

## 6. Environment Configuration

- [x] 6.1 添加 CRON_SECRET 环境变量到 .env.local 示例

## 7. Unit Tests

- [ ] 7.1 编写 lib/rss/fetcher.ts 单元测试（__tests__/lib/rss/fetcher.test.ts）
  - [ ] 7.1.1 测试 parseRSS 成功解析
  - [ ] 7.1.2 测试 parseRSS 超时处理
  - [ ] 7.1.3 测试 dedupeItems 去重逻辑
  - [ ] 7.1.4 测试 calculateReadingTime 计算逻辑
- [ ] 7.2 编写 app/api/feeds/[id]/refresh/route.test.ts
  - [ ] 7.2.1 测试成功刷新
  - [ ] 7.2.2 测试 feed 不存在返回 404
  - [ ] 7.2.3 测试权限验证（无权访问他人 feed）
- [ ] 7.3 编写 workers/rss-worker.test.ts
  - [ ] 7.3.1 测试最小间隔跳过逻辑
  - [ ] 7.3.2 测试批量处理函数

## 8. Integration & Validation

- [x] 8.1 运行 pnpm lint 并确认无 error（无新增 warning）
- [ ] 8.2 运行 pnpm test 并确认全部通过（无失败/无报错）
- [x] 8.3 运行 pnpm exec tsc --noEmit 确认零类型错误
- [ ] 8.4 手动测试：订阅真实 RSS feed 验证 items 被抓取
- [ ] 8.5 手动测试：启动 worker 验证定时抓取工作
- [ ] 8.6 手动测试：刷新按钮功能验证

## 9. Documentation

- [x] 9.1 更新 CLAUDE.md 添加 worker 启动说明
- [x] 9.2 创建 ecosystem.config.cjs 示例（pm2 配置）
