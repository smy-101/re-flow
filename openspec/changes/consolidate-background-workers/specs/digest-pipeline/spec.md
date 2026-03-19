## ADDED Requirements

### Requirement: 摘要发送前刷新相关 RSS 源

系统 SHALL 在发送邮件摘要前，根据过滤规则刷新相关的 RSS 源。

#### Scenario: filterType=all 时刷新所有源
- **WHEN** 摘要配置的 filterType=all
- **THEN** 系统刷新该用户的所有 RSS 源

#### Scenario: filterType=category 时刷新分类源
- **WHEN** 摘要配置的 filterType=category 且 filterValue="技术"
- **THEN** 系统仅刷新分类为"技术"的 RSS 源

#### Scenario: filterType=feed 时刷新指定源
- **WHEN** 摘要配置的 filterType=feed 且 filterValue=123
- **THEN** 系统仅刷新 feedId=123 的 RSS 源

---

### Requirement: RSS 刷新后执行 AI 处理

系统 SHALL 在 RSS 刷新完成后，对需要处理的新文章执行 AI Pipeline。

#### Scenario: 处理新抓取的文章
- **WHEN** RSS 刷新抓取到新文章
- **AND** 对应 Feed 的 autoProcess=true
- **THEN** 系统对该文章执行配置的 AI Pipeline
- **AND** 将结果存入 processing_results 表

#### Scenario: 等待 AI 处理完成
- **WHEN** 所有相关文章的 AI 处理完成或超时
- **THEN** 系统继续执行邮件发送流程

---

### Requirement: 处理超时限制

系统 SHALL 对整个处理流程设置最大等待时间。

#### Scenario: 10 分钟总超时
- **WHEN** 处理流程（RSS 刷新 + AI 处理）超过 10 分钟
- **THEN** 系统停止等待，使用现有内容发送邮件

#### Scenario: 单源 10 秒超时
- **WHEN** 单个 RSS 源抓取超过 10 秒
- **THEN** 系统取消该源的抓取，继续处理其他源

---

### Requirement: 处理流程错误处理

系统 SHALL 妥善处理处理流程中的各类错误。

#### Scenario: RSS 抓取失败
- **WHEN** 部分 RSS 源抓取失败
- **THEN** 系统记录错误日志
- **AND** 继续处理成功抓取的源
- **AND** 邮件内容包含已成功抓取的文章

#### Scenario: AI 处理失败
- **WHEN** 部分文章的 AI 处理失败
- **THEN** 系统记录错误日志
- **AND** 邮件内容仍包含该文章（无 AI 处理结果）

#### Scenario: 全部失败时仍发送邮件
- **WHEN** 所有 RSS 源抓取都失败
- **THEN** 系统发送邮件，内容为空或显示错误提示
- **AND** 记录详细的错误日志
