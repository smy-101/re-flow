## Why

用户订阅 RSS feed 后，feed 记录被创建但从未获取实际内容，导致订阅列表为空，无内容可读。当前 `/api/feeds/validate` 已有 RSS 解析能力（使用 `rss-parser`），但订阅流程没有触发内容抓取。

## What Changes

- **新增 RSS 内容抓取服务** (`lib/rss/fetcher.ts`)
  - 从 feed URL 解析 RSS 内容
  - 去重逻辑（基于 `link` 字段）
  - 将 items 存入 `feed_items` 表

- **新增独立 Worker 进程** (`workers/rss-worker.ts`)
  - 定时抓取所有订阅（cron 间隔 30 分钟）
  - 为后续 AI 处理预留扩展点（总结、标签、排序）
  - 独立于 Next.js 进程运行

- **新增手动刷新 API**
  - `POST /api/feeds/[id]/refresh` - 单个 feed 手动刷新
  - `POST /api/feeds/refresh-all` - 批量刷新（供 cron 调用）

- **修改订阅 API**
  - `POST /api/feeds` - 创建 feed 后触发后台抓取（非阻塞）

- **前端增强**
  - FeedCard 添加刷新按钮
  - 加载状态和错误提示

## Capabilities

### New Capabilities
- `rss-feed-fetching`: RSS feed 解析、去重、存储到数据库
- `rss-worker`: 后台定时抓取所有订阅，支持后续 AI 处理扩展
- `rss-refresh-api`: 手动刷新接口，支持单个/批量刷新

### Modified Capabilities
- 无（现有规格不变，仅实现缺失功能）

## Impact

**影响范围:**
- 新增 `lib/rss/` 目录（fetcher, scheduler）
- 新增 `workers/rss-worker.ts`
- 修改 `app/api/feeds/route.ts`（创建后触发抓取）
- 新增 `app/api/feeds/[id]/refresh/route.ts`
- 新增 `app/api/feeds/refresh-all/route.ts`
- 修改 `components/feeds/FeedCard.tsx`（添加刷新按钮）
- 修改 `package.json`（添加 worker 启动脚本）

**新增依赖:**
- `node-cron` - Worker 定时任务

**部署变化:**
- 生产环境需同时运行 Next.js 和 Worker 进程
- 开发环境需两个终端或进程管理器（pm2）
