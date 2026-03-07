## Why

当前用户需要手动在文章详情页选择管道或模板来处理 RSS 文章。对于订阅量大的用户，这 becomes 重复且低效。本功能允许用户为每个 RSS 订阅预配置处理管道或模板，当新文章被抓取时自动加入处理队列，实现"配置一次，自动处理"的工作流。

## What Changes

- `feeds` 表新增 `pipeline_id`、`template_id`、`auto_process` 字段
- 新增 `processing_queue` 表用于存储待处理任务
- RSS fetcher 在抓取新文章时自动将符合条件的文章加入队列
- 新增 Processing Worker 后台进程消费队列任务
- 新增队列状态 API 供前端轮询
- Feed 设置页面新增自动处理配置
- 文章详情页显示实时处理状态（排队中/处理中/已完成/失败）

## Capabilities

### New Capabilities

- `feed-auto-processing`: 为 RSS 订阅配置自动处理管道/模板，新文章自动加入处理队列
- `processing-queue`: 处理队列管理，支持任务入队、状态查询、失败重试
- `processing-worker`: 后台 Worker 进程，从队列消费任务并执行 AI 处理

### Modified Capabilities

- `feed-management`: Feed 创建/编辑接口新增自动处理配置字段
- `article-processing`: 文章详情页显示队列状态，支持实时轮询
- `rss-feed-fetching`: 抓取新文章时检查订阅配置，自动入队

## Impact

- **数据库**: `feeds` 表新增 3 个字段；新增 `processing_queue` 表
- **API**: 新增 `GET /api/queue/status`；修改 `/api/feeds` 相关接口
- **Worker**: 新增 `workers/processing-worker.ts`，需独立进程运行
- **前端**: Feed 设置页、文章详情页需修改
- **package.json**: 新增 `pnpm worker:processing` 脚本
