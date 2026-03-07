# Processing Worker

## Purpose

后台 Worker 进程，从队列消费任务并执行 AI 处理。

## ADDED Requirements

### Requirement: 轮询队列

系统 SHALL 定期检查队列中的待处理任务。

#### Scenario: 定期轮询
- **WHEN** Worker 运行时
- **THEN** 每 10 秒检查一次队列
- **AND** 获取 `status='pending'` 的任务

#### Scenario: 任务优先级
- **WHEN** 队列有多个待处理任务
- **THEN** 按 `priority` 降序、`created_at` 升序处理
- **AND** 每次只处理一个任务

#### Scenario: 无待处理任务
- **WHEN** 队列为空
- **THEN** Worker 空闲等待下一次轮询

---

### Requirement: 执行处理

系统 SHALL 执行队列任务的 AI 处理。

#### Scenario: 执行管道
- **WHEN** 任务配置了 `pipeline_id`
- **THEN** 系统调用 `executePipeline()` 处理文章
- **AND** 按管道步骤顺序执行

#### Scenario: 执行模板
- **WHEN** 任务配置了 `template_id`
- **THEN** 系统调用 `executeSingleTemplate()` 处理文章

#### Scenario: 处理超时
- **WHEN** 单个任务执行超过 60 秒
- **THEN** 系统取消当前处理
- **AND** 任务标记为失败

---

### Requirement: 存储结果

系统 SHALL 将处理结果存入 `processing_results` 表。

#### Scenario: 处理成功
- **WHEN** AI 处理成功完成
- **THEN** 系统创建 `processing_results` 记录
- **AND** 记录 `output`、`tokens_used`、`steps_output`
- **AND** 队列任务状态设为 `done`
- **AND** 记录 `completed_at`

#### Scenario: 处理失败
- **WHEN** AI 处理失败
- **THEN** 系统更新 `attempts` 和 `error_message`
- **AND** 根据重试策略更新状态

---

### Requirement: 错误处理

系统 SHALL 妥善处理各类错误。

#### Scenario: AI API 错误
- **WHEN** AI API 返回错误（如 429、500）
- **THEN** 任务标记为失败
- **AND** 记录错误信息

#### Scenario: 配置缺失
- **WHEN** 任务引用的管道或模板不存在
- **THEN** 任务标记为 `error`
- **AND** 记录"配置不存在"错误

#### Scenario: AI Config 禁用
- **WHEN** 任务引用的 AI Config 被禁用
- **THEN** 任务标记为 `error`
- **AND** 记录"AI 配置已禁用"错误

---

### Requirement: 进程管理

系统 SHALL 支持优雅启动和关闭。

#### Scenario: 启动时恢复
- **WHEN** Worker 启动
- **THEN** 将所有 `processing` 状态的任务重置为 `pending`

#### Scenario: 优雅关闭
- **WHEN** 收到 SIGINT 或 SIGTERM 信号
- **THEN** Worker 停止接收新任务
- **AND** 等待当前任务完成（最多 30 秒）
- **AND** 未完成的任务保持 `processing` 状态（下次重启恢复）
