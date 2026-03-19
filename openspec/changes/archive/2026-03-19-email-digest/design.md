## Context

Re:Flow 是一个 RSS 订阅管理应用，已有完整的 RSS 拉取（rss-worker）、AI 内容处理（craft templates、pipelines）和邮件发送（nodemailer）基础设施。用户已验证邮箱后可使用邮件推送功能。

**现有基础设施**：
- `lib/auth/email.ts`：邮件发送封装（SMTP）
- `workers/rss-worker.ts`：后台定时拉取（node-cron）
- `processing_results` 表：存储 AI 处理结果
- `feeds.autoProcess` 字段：标记是否启用 AI 处理

## Goals / Non-Goals

**Goals：**
- 实现可配置的定时邮件推送，支持每日/每周/自定义周期
- 支持用户自定义时区，按本地时间发送
- 智能内容格式：有 AI 处理结果显示处理结果，无则显示简洁列表
- 支持按分类/订阅源筛选推送范围
- 失败重试机制：连续失败 3 次自动暂停

**Non-Goals：**
- 实时推送（每篇新文章立即推送）
- 个性化推荐算法
- 邮件内的富媒体内容（图片、视频）
- 多语言邮件模板

## Decisions

### 1. Worker 架构

**决定**：创建独立的 `digest-worker.ts`，与 `rss-worker.ts` 并行运行

**理由**：
- 职责分离：RSS 拉取和邮件推送是独立的定时任务
- 故障隔离：一个 worker 崩溃不影响另一个
- 可独立部署和扩展

**备选方案**：合并到 rss-worker
- ❌ 耦合度高，不利于维护
- ❌ 拉取频率（30分钟）和推送检查频率（5分钟）不同

### 2. 时间窗口计算

**决定**：使用固定窗口（按频率计算：daily=24h, weekly=7d, custom=Nd）

**理由**：
- 逻辑简单，用户容易理解
- 避免滑动窗口导致的重复/遗漏问题

**备选方案**：滑动窗口（从上次发送时间算起）
- ❌ 上次发送失败时会导致内容堆积或遗漏

### 3. 数据库 Schema

**决定**：三表设计

```
email_digest_configs  - 主配置表
email_digest_filters  - 筛选规则（一对多）
email_digest_logs     - 发送历史（用于排查问题）
```

**理由**：
- 筛选规则独立成表，支持灵活的多条件组合
- 日志表便于排查发送问题和统计

### 4. 时区处理

**决定**：存储用户时区（IANA 格式如 `Asia/Shanghai`），Worker 用 `luxon` 或 `date-fns-tz` 计算

**理由**：
- IANA 时区标准，支持夏令时
- 用户可按本地时间设置发送时刻

### 5. 邮件内容生成

**决定**：按 Feed 分组，每个 FeedItem 根据 `feed.autoProcess` 决定内容格式

```
Feed.autoProcess = true  → 查询 processing_results.output → 显示 AI 处理结果
Feed.autoProcess = false → 显示标题 + 来源 + 链接
```

**理由**：
- 复用现有 AI 处理结果，无需额外处理
- 两种格式自然融合，用户体验一致

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 大量用户同时发送导致 SMTP 限流 | 顺序发送 + 间隔 500ms + 错误捕获 |
| 邮件被标记为垃圾邮件 | 配置 SPF/DKIM，提供退订链接 |
| 时区计算错误 | 使用成熟的时区库，单元测试覆盖边界情况 |
| 用户邮箱失效 | 连续失败 3 次自动暂停，通知用户 |

## Migration Plan

1. **数据库迁移**：`drizzle-kit generate && drizzle-kit migrate`
2. **部署 Worker**：`pnpm worker:digest`（新增 npm script）
3. **前端页面**：部署后用户可在 `/settings/digest` 开启功能
4. **监控**：日志表记录发送状态，便于排查

**回滚策略**：
- 禁用 worker 进程即可停止推送
- 数据库表可保留，不影响其他功能
