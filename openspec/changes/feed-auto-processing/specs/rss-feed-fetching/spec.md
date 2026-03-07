# RSS Feed Fetching (Delta)

## ADDED Requirements

### Requirement: 自动入队新文章

系统 SHALL 在抓取新文章时自动将符合条件的文章加入处理队列。

#### Scenario: 启用自动处理的订阅
- **WHEN** RSS 抓取器获取到新文章
- **AND** 对应订阅的 `auto_process` 为 `true`
- **AND** 订阅配置了 `pipeline_id` 或 `template_id`
- **THEN** 系统为每篇新文章创建队列任务
- **AND** 任务状态为 `pending`
- **AND** 任务继承订阅的 `pipeline_id` 或 `template_id`

#### Scenario: 未启用自动处理的订阅
- **WHEN** RSS 抓取器获取到新文章
- **AND** 对应订阅的 `auto_process` 为 `false`
- **THEN** 系统不创建队列任务

#### Scenario: 订阅无处理配置
- **WHEN** RSS 抓取器获取到新文章
- **AND** 对应订阅的 `auto_process` 为 `true`
- **AND** 但 `pipeline_id` 和 `template_id` 都为 `null`
- **THEN** 系统不创建队列任务

---

### Requirement: 入队错误处理

系统 SHALL 妥善处理入队过程中的错误。

#### Scenario: 入队失败不影响抓取
- **WHEN** 创建队列任务时发生错误
- **THEN** 系统记录错误日志
- **AND** 文章仍然正常保存到数据库
- **AND** 抓取流程继续执行

#### Scenario: 避免重复入队
- **WHEN** 文章已在队列中（存在非 `done` 状态的任务）
- **THEN** 系统不创建重复的队列任务
