## Why

当前项目运行 4 个独立后台进程（rss-worker、digest-worker、processing-worker、remote-rss-mcp），运维成本高且资源利用效率低。RSS 每 30 分钟自动抓取，但大部分抓取是无效的——用户真正需要新鲜数据的时间点是邮件摘要发送前。通过合并服务并按需抓取，可以减少不必要的网络请求和数据库写入。

## What Changes

- **合并 rss-worker 和 processing-worker 到 digest-worker**：在发送邮件摘要前，按需刷新相关 RSS 源并执行 AI 处理
- **删除独立进程**：移除 `workers/rss-worker.ts` 和 `workers/processing-worker.ts`
- **保留 remote-rss-mcp 独立部署**：MCP 服务是 HTTP 服务器，需持续运行
- **保留手动刷新 API**：用户仍可通过 `/api/feeds/[id]/refresh` 手动触发

## Capabilities

### New Capabilities

- `digest-pipeline`: 邮件摘要发送前的完整处理流水线，包括 RSS 刷新、AI 处理、邮件发送

### Modified Capabilities

- `rss-fetcher`: 从定时抓取改为按需触发，增加"仅刷新指定 RSS 源"的能力
- `processing-queue`: 从独立轮询改为在摘要流程中同步执行

## Impact

- **删除文件**：`workers/rss-worker.ts`、`workers/processing-worker.ts`
- **修改文件**：`workers/digest-worker.ts`、`lib/digest/worker.ts`、`package.json`
- **新增文件**：`lib/digest/refresher.ts`、`lib/digest/ai-processor.ts`
- **行为变更**：邮件摘要发送会有 1-3 分钟延迟（等待 RSS 抓取和 AI 处理）
- **API 不变**：手动刷新接口保持兼容
