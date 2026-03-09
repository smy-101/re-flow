# Purpose

提供 API 端点支持将文章加入处理队列，实现异步入队处理。

## Requirements

### Requirement: 入队 API 端点

系统 SHALL 提供 `POST /api/queue/add` 端点用于将文章加入处理队列。

#### Scenario: 使用模板入队
- **WHEN** 客户端发送 `POST /api/queue/add`
- **AND** 请求体包含 `feedItemId` 和 `templateId`
- **THEN** 系统创建队列任务
- **AND** 任务状态为 `pending`
- **AND** 返回 `{ success: true, jobId, isNew: true }`

#### Scenario: 使用管道入队
- **WHEN** 客户端发送 `POST /api/queue/add`
- **AND** 请求体包含 `feedItemId` 和 `pipelineId`
- **THEN** 系统创建队列任务
- **AND** 任务状态为 `pending`
- **AND** 返回 `{ success: true, jobId, isNew: true }`

#### Scenario: 文章已在队列中
- **WHEN** 文章已有队列任务（状态为 `pending` 或 `processing`）
- **THEN** 系统返回已有任务信息
- **AND** 返回 `{ success: true, jobId, isNew: false }`

#### Scenario: 参数验证失败
- **WHEN** 请求缺少 `feedItemId`
- **THEN** 系统返回 400 错误
- **AND** 错误信息为"请选择要处理的文章"

#### Scenario: 未同时提供模板和管道
- **WHEN** 请求同时包含 `templateId` 和 `pipelineId`
- **THEN** 系统返回 400 错误
- **AND** 错误信息为"只能选择模板或管道其中之一"

#### Scenario: 未提供模板或管道
- **WHEN** 请求既不包含 `templateId` 也不包含 `pipelineId`
- **THEN** 系统返回 400 错误
- **AND** 错误信息为"请选择模板或管道"

---

### Requirement: 入队客户端函数

系统 SHALL 提供前端调用的类型安全函数 `addToQueue()`。

#### Scenario: 函数签名
- **WHEN** 前端调用 `addToQueue({ feedItemId, templateId })`
- **THEN** 函数发送 POST 请求到 `/api/queue/add`
- **AND** 返回类型为 `Promise<AddToQueueResponse>`

#### Scenario: 返回类型
- **WHEN** 入队成功
- **THEN** 返回包含 `success: true`、`jobId`、`isNew` 字段

#### Scenario: 错误处理
- **WHEN** 请求失败
- **THEN** 函数抛出包含错误信息的 Error
