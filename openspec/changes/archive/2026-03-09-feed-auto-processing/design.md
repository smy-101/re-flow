## Context

当前系统已具备管道（Pipeline）和工艺模板（Craft Template）的完整 CRUD 功能，用户可在文章详情页手动选择处理方式。RSS Worker 每 30 分钟自动抓取新文章。本设计旨在将两者连接，实现"配置一次，自动处理"的工作流。

## Goals / Non-Goals

**Goals:**
- 为每个 RSS 订阅预配置处理管道或模板
- 新文章抓取后自动加入处理队列
- 后台 Worker 消费队列执行 AI 处理
- 用户可在文章详情页查看实时处理状态

**Non-Goals:**
- 不支持分类级别的默认管道（仅支持订阅级别）
- 不实现处理失败的通知功能（静默失败）
- 不实现批量重试失败的队列任务

## Decisions

### D1: 数据模型扩展

**决策**: 在 `feeds` 表新增三个字段，新建 `processing_queue` 表。

```
feeds 表新增:
┌─────────────────┬─────────────────────────────────────────┐
│ 字段            │ 说明                                    │
├─────────────────┼─────────────────────────────────────────┤
│ pipeline_id     │ INTEGER NULL, 关联 pipelines.id         │
│ template_id     │ INTEGER NULL, 关联 craft_templates.id   │
│ auto_process    │ BOOLEAN NOT NULL DEFAULT false          │
└─────────────────┴─────────────────────────────────────────┘

约束: pipeline_id 和 template_id 互斥（只能有一个非空）

processing_queue 表:
┌─────────────────┬─────────────────────────────────────────┐
│ 字段            │ 说明                                    │
├─────────────────┼─────────────────────────────────────────┤
│ id              │ INTEGER PRIMARY KEY                     │
│ user_id         │ INTEGER NOT NULL → users.id             │
│ feed_item_id    │ INTEGER NOT NULL → feed_items.id        │
│ pipeline_id     │ INTEGER NULL → pipelines.id             │
│ template_id     │ INTEGER NULL → craft_templates.id       │
│ status          │ TEXT: pending|processing|done|error     │
│ priority        │ INTEGER DEFAULT 0                       │
│ attempts        │ INTEGER DEFAULT 0                       │
│ max_attempts    │ INTEGER DEFAULT 3                       │
│ error_message   │ TEXT NULL                               │
│ created_at      │ INTEGER                                 │
│ started_at      │ INTEGER NULL                            │
│ completed_at    │ INTEGER NULL                            │
└─────────────────┴─────────────────────────────────────────┘
```

**理由**: 使用 SQLite 表作为队列保证持久化，Worker 崩溃后任务不丢失。

### D2: RSS Fetcher 集成

**决策**: 修改 `lib/rss/fetcher.ts` 的 `storeItems()` 函数。

```
storeItems() 新增逻辑:
1. 获取 feed 配置（含 pipeline_id, template_id, auto_process）
2. 插入 feed_items 后
3. 对每个新 item:
   if (feed.auto_process && (feed.pipeline_id || feed.template_id)):
     await addToProcessingQueue(item, feed)
```

**理由**: 在存储新文章后立即入队，确保不遗漏。

### D3: Processing Worker 架构

**决策**: 独立 Worker 进程，类似 RSS Worker 模式。

```
workers/processing-worker.ts:
- 每 10 秒轮询队列
- 获取 status='pending' 的任务（按 priority DESC, created_at ASC）
- 标记 status='processing', started_at=now
- 执行 executePipeline() 或 executeSingleTemplate()
- 成功: 创建 processing_result, status='done', completed_at=now
- 失败: attempts++, 若 attempts >= max_attempts 则 status='error'
- 失败重试: 指数退避 (1min, 5min, 15min)
```

**理由**: 独立进程可单独扩展，不阻塞主应用。

### D4: 前端状态轮询

**决策**: 文章详情页使用轮询获取队列状态。

```
轮询逻辑:
- 当 processing_results 中有 status='pending' 或 'processing' 时
- 每 5 秒调用 GET /api/queue/status?feed_item_id=X
- 状态变为 'done' 或 'error' 时停止轮询
```

**理由**: 简单可靠，无需 WebSocket。

### D5: Feed 设置 UI

**决策**: 在 Feed 编辑页面新增"自动处理"配置区块。

```
新增 UI 组件:
- 开关: 启用自动处理 (auto_process)
- 单选: 处理类型 (管道 / 单个模板)
- 下拉: 选择管道或模板（根据类型动态加载）
```

**理由**: 配置与 Feed 绑定，符合用户心智模型。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 大量订阅同时处理导致 API 限流 | Worker 顺序处理，内置延迟 |
| AI API 调用失败 | 最多重试 3 次，指数退避 |
| 队列积压 | 显示队列位置，用户有心理预期 |
| 前端轮询增加服务器负载 | 5 秒间隔，仅在有活跃任务时轮询 |
