## REMOVED Requirements

### Requirement: 轮询队列

**Reason**: 队列处理改为在摘要发送流程中同步执行，不再需要独立轮询

**Migration**: 删除独立的 `workers/processing-worker.ts`，AI 处理逻辑合并到 digest-worker

---

## MODIFIED Requirements

### Requirement: 任务入队

系统 SHALL 支持将待处理文章加入队列。

#### Scenario: 新文章自动入队
- **WHEN** RSS 抓取器获取新文章（在摘要流程中）
- **AND** 对应订阅的 `auto_process` 为 `true`
- **THEN** 系统创建队列任务
- **AND** 任务状态为 `pending`
- **AND** 记录 `pipeline_id` 或 `template_id`

#### Scenario: 同一文章不重复入队
- **WHEN** 文章已在队列中（状态非 `done`）
- **THEN** 系统不创建重复任务

---

### Requirement: 任务状态管理

系统 SHALL 支持队列任务的状态流转。

#### Scenario: 同步处理状态流转
- **WHEN** 任务在摘要流程中被处理时
- **THEN** 状态立即从 `pending` 变为 `processing`
- **WHEN** 处理成功时
- **THEN** 状态变为 `done`
- **WHEN** 处理失败时
- **THEN** 状态变为 `error`
- **AND** 记录 `error_message`

---

## ADDED Requirements

### Requirement: 同步执行 AI 处理

系统 SHALL 在摘要流程中同步执行 AI 处理，而非异步轮询。

#### Scenario: 刷新后立即处理
- **WHEN** RSS 刷新完成
- **THEN** 系统立即开始处理所有待处理任务
- **AND** 等待所有任务完成或超时

#### Scenario: 处理完成后再发送
- **WHEN** 所有 AI 处理任务完成
- **THEN** 系统继续执行邮件发送流程
