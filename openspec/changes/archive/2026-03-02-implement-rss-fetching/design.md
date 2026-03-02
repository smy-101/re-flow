## Context

当前 RSS feed 功能仅有数据库表结构和 UI，缺少核心的内容抓取能力。`/api/feeds/validate` 已实现 RSS 解析（使用 `rss-parser`），但此逻辑未被复用。

用户计划自托管服务并后续引入 AI 处理（摘要、标签、排序），因此架构需支持独立的 Worker 进程。

## Goals / Non-Goals

**Goals:**
- 订阅 RSS feed 后自动获取内容并存入数据库
- 提供手动刷新能力（单个 feed 批量刷新）
- 后台定时抓取所有订阅（30 分钟间隔）
- 为 AI 处理预留扩展点（Worker 架构）

**Non-Goals:**
- 本次不实现 AI 功能（仅预留扩展点）
- 不限制每个 feed 的 item 数量
- 不实现复杂的去重策略（仅基于 `link` 字段）

## Decisions

### 1. 独立 Worker 进程 vs In-Process

**决策：** 使用独立 Node.js Worker 进程

**原因：**
- 用户自托管，不受 Vercel 限制
- 与 Next.js 解耦，便于后续添加 AI 处理
- Worker 崩溃不影响 Web 服务
- 便于独立监控和调试

**替代方案：** In-Process setInterval（简单但耦合，重启后丢失）

### 2. 去重策略

**决策：** 使用 RSS item 的 `link` 字段作为唯一标识

**原因：**
- `link` 是 RSS 规范标准字段，几乎所有 feed 都提供
- 简单有效，不需要额外的指纹逻辑
- 数据库已有 `link` 字段索引

**风险：** 部分 feed 可能没有 `link` 或 `link` 不唯一 → 降级使用 `guid` 或 `title+pubDate`

### 3. 后台抓取触发时机

**决策：** 订阅成功后立即返回，Worker 后台异步抓取

**原因：**
- 避免阻塞用户操作（RSS 抓取可能耗时）
- 用户体验更好（快速返回）
- 失败不影响 feed 记录（可手动重试）

### 4. Worker 定时器选择

**决策：** 使用 `node-cron` 库

**原因：**
- 标准 cron 表达式，易于配置
- 成熟稳定，社区广泛使用
- 与系统 cron 解耦，便于跨平台

**替代方案：** 系统 cron + HTTP 调用（需要额外鉴权配置）

### 5. 数据库 Schema 扩展（为 AI 预留）

**决策：** 暂不新增表，仅预留字段规划

**原因：**
- 本阶段专注于抓取功能
- AI 需求尚未明确，避免过度设计
- 后续可迁移或添加关联表

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        System Architecture                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Next.js App     │         │  RSS Worker      │
│  (UI + API)      │         │  (Background)    │
├──────────────────┤         ├──────────────────┤
│ • /api/feeds     │         │ • node-cron      │
│ • /api/items     │         │ • fetcher.ts     │
│ • FeedCard UI    │         │ • 30 min interval│
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         └────────────┬───────────────┘
                      ▼
              ┌───────────────┐
              │   SQLite DB   │
              ├───────────────┤
              │ feeds         │
              │ feed_items    │
              └───────────────┘
```

## File Changes

### 新增文件

```
lib/rss/
  ├── fetcher.ts          # RSS 解析和存储逻辑
  └── types.ts            # RSS 相关类型定义

workers/
  └── rss-worker.ts       # 独立 Worker 进程

app/api/feeds/
  ├── [id]/refresh/
  │   └── route.ts        # 单个 feed 刷新 API
  └── refresh-all/
      └── route.ts        # 批量刷新 API（Worker 调用）

components/feeds/
  └── FeedCard.tsx        # 修改：添加刷新按钮
```

### 修改文件

```
app/api/feeds/route.ts    # POST：创建 feed 后触发后台抓取
lib/api/feeds.ts          # 新增 refreshFeed() 函数
package.json              # 新增 worker 启动脚本
```

## API Endpoints

```
POST /api/feeds/[id]/refresh
  • 手动刷新单个 feed
  • 返回：{ success: true, itemsAdded: 5, error?: string }

POST /api/feeds/refresh-all
  • 刷新所有 feeds（Worker 调用）
  • 需要内部鉴权（CRON_SECRET）
  • 返回：{ processed: 10, results: [...] }
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| RSS 抓取超时/失败 | 设置 10 秒超时，失败记录 error，允许手动重试 |
| 重复 items 导致数据库膨胀 | 基于 `link` 去重，数据库唯一索引约束 |
| Worker 与 Next.js 重复抓取 | `lastUpdatedAt` 字段避免频繁抓取（最小间隔 5 分钟） |
| Feed URL 不可达 | validate 端点已验证，Worker 静默失败，不中断整体流程 |
| 并发写入冲突 | SQLite 事务保护，唯一索引防止重复 |

## Migration Plan

### 开发环境

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm worker:rss
```

### 生产环境

使用进程管理器（推荐 pm2）：

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    { name: 'nextjs', script: 'pnpm', args: 'start' },
    { name: 'rss-worker', script: 'tsx', args: 'workers/rss-worker.ts' }
  ]
}
```

启动：`pm2 start ecosystem.config.cjs`

### Rollback

- 停止 Worker：`pm2 stop rss-worker`
- Next.js 不受影响，仅失去自动抓取
- 手动刷新仍可用

## Open Questions

1. **AI 处理触发时机：** 是在抓取后立即处理还是单独队列？ → 本次不实现，留待 Phase 2
2. **抓取失败重试策略：** 是否需要指数退避重试？ → 当前简单失败，后续可优化
3. **Feed 数量限制：** 用户可订阅多少 feed？ → 当前不限制，后续关注性能
