# 处理队列

## Purpose

管理待处理文章的队列，支持入队、状态查询、失败重试。

## ADDED Requirements

### Requirement: 任务入队

系统 SHALL 支持将待处理文章加入队列。

#### Scenario: 新文章自动入队
- **WHEN** RSS 抓取器获取新文章
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

#### Scenario: 状态流转
- **WHEN** 任务创建时
- **THEN** 状态为 `pending`
- **WHEN** Worker 开始处理时
- **THEN** 状态变为 `processing`
- **WHEN** 处理成功时
- **THEN** 状态变为 `done`
- **WHEN** 处理失败且未达最大重试次数时
- **THEN** 状态恢复为 `pending`
- **WHEN** 处理失败且已达最大重试次数时
- **THEN** 状态变为 `error`

---

### Requirement: 失败重试

系统 SHALL 支持失败任务的自动重试。

#### Scenario: 首次失败
- **WHEN** 任务首次处理失败
- **THEN** `attempts` 加 1
- **AND** 状态恢复为 `pending`
- **AND** 等待 1 分钟后可再次处理

#### Scenario: 多次失败
- **WHEN** 任务第 N 次处理失败
- **THEN** 等待时间按指数增长（1min → 5min → 15min）

#### Scenario: 达到最大重试次数
- **WHEN** 任务失败次数达到 `max_attempts`（默认 3）
- **THEN** 状态变为 `error`
- **AND** 记录 `error_message`
- **AND** 不再自动重试

---

### Requirement: 队列状态查询

系统 SHALL 支持查询文章的队列状态。

#### Scenario: 查询队列状态
- **WHEN** 前端请求 `GET /api/queue/status?feed_item_id=X`
- **THEN** 系统返回该文章的队列状态
- **AND** 包含 `status`、`position`（排队位置）、`attempts`

#### Scenario: 无队列任务
- **WHEN** 文章未被加入队列
- **THEN** 系统返回 `null` 或空对象

---

### Requirement: 队列持久化

系统 SHALL 确保队列任务在服务重启后不丢失。

#### Scenario: 服务重启
- **WHEN** Worker 进程重启
- **THEN** 所有 `pending` 和 `processing` 状态的任务保留
- **AND** `processing` 状态的任务重置为 `pending`（重新处理）
