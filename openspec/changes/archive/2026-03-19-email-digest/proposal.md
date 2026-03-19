## Why

用户订阅了多个 RSS 源后，需要主动打开应用才能查看更新。这种方式存在两个问题：

1. **信息获取被动**：用户容易错过重要内容，特别是低频更新的订阅源
2. **使用场景受限**：无法在通勤、休息等碎片时间通过邮件快速浏览订阅动态

通过定时邮件推送，用户可以被动接收订阅更新，提升信息获取效率和产品粘性。

## What Changes

- 新增邮件推送功能，支持用户自定义推送频率（每日/每周/每N天）
- 新增推送配置管理，支持时区选择、分类/订阅源筛选
- 邮件内容智能适配：已配置 AI 处理的订阅源显示处理结果，未配置的显示简洁标题列表
- 新增独立的 digest-worker 后台进程，负责定时检查和发送
- 新增推送设置页面，用户可自主配置和管理推送偏好

## Capabilities

### New Capabilities

- `email-digest-config`: 邮件推送配置管理，包括开关、频率、时区、筛选规则等
- `email-digest-worker`: 后台定时任务，检查到期配置并生成/发送邮件
- `email-digest-template`: 推送邮件 HTML 模板，支持 AI 处理结果和简洁两种格式

### Modified Capabilities

无现有能力变更。

## Impact

**数据库**：
- 新增 `email_digest_configs` 表（推送配置）
- 新增 `email_digest_filters` 表（筛选规则）
- 新增 `email_digest_logs` 表（发送历史）

**API**：
- 新增 `/api/digest-config` 路由（CRUD 配置）

**Worker**：
- 新增 `workers/digest-worker.ts`（独立后台进程）

**前端**：
- 新增 `app/(dashboard)/settings/digest/` 设置页面

**依赖**：
- 复用现有 `lib/auth/email.ts` 邮件发送基础设施
- 复用现有 `lib/db/schema.ts` 中的 `processing_results` 表获取 AI 处理结果
