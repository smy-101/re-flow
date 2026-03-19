## ADDED Requirements

### Requirement: Worker 定时检查待发送配置

系统 SHALL 每 5 分钟检查一次是否有配置需要发送。

#### Scenario: 检查到期配置
- **WHEN** Worker 执行定时检查
- **THEN** 系统查询 enabled=true 且 pausedDueToFailures=false 且 nextSendAt <= 当前时间的配置

#### Scenario: 跳过未验证邮箱
- **WHEN** 配置关联的用户邮箱未验证
- **THEN** 系统跳过该配置，不发送邮件

### Requirement: Worker 查询时间窗口内的未读文章

系统 SHALL 根据配置的频率计算时间窗口，查询未读文章。

#### Scenario: 每日推送时间窗口
- **WHEN** 配置频率为 daily
- **THEN** 系统查询过去 24 小时内发布的未读文章

#### Scenario: 每周推送时间窗口
- **WHEN** 配置频率为 weekly
- **THEN** 系统查询过去 7 天内发布的未读文章

#### Scenario: 自定义天数时间窗口
- **WHEN** 配置频率为 custom 且 customDays=N
- **THEN** 系统查询过去 N 天内发布的未读文章

### Requirement: Worker 应用筛选规则

系统 SHALL 根据配置的筛选规则过滤文章列表。

#### Scenario: 全部订阅
- **WHEN** filterType=all
- **THEN** 系统返回用户所有订阅源的文章

#### Scenario: 按分类筛选
- **WHEN** filterType=category 且 filterValue="技术"
- **THEN** 系统仅返回分类为"技术"的订阅源的文章

#### Scenario: 按订阅源筛选
- **WHEN** filterType=feed 且 filterValue=123
- **THEN** 系统仅返回 feedId=123 的文章

### Requirement: Worker 生成邮件内容

系统 SHALL 根据 Feed 的 AI 配置决定内容格式。

#### Scenario: 有 AI 处理结果
- **WHEN** feed.autoProcess=true 且 processing_results 存在
- **THEN** 系统显示标题 + AI 处理结果 + 阅读原文链接

#### Scenario: 无 AI 处理结果
- **WHEN** feed.autoProcess=false
- **THEN** 系统显示标题 + 来源 + 阅读原文链接

#### Scenario: 无文章时跳过发送
- **WHEN** 应用筛选规则后无符合条件的文章
- **THEN** 系统跳过本次发送，更新 nextSendAt

### Requirement: Worker 发送邮件并更新状态

系统 SHALL 发送邮件并更新配置状态。

#### Scenario: 发送成功
- **WHEN** 邮件发送成功
- **THEN** 系统更新 lastSentAt=当前时间，consecutiveFailures=0，记录日志，计算 nextSendAt

#### Scenario: 发送失败
- **WHEN** 邮件发送失败
- **THEN** 系统增加 consecutiveFailures，记录错误日志，若达到阈值则设置 pausedDueToFailures=true

#### Scenario: 计算下次发送时间
- **WHEN** 发送完成（成功或失败）
- **THEN** 系统根据 frequency 和 sendTime 计算下一个发送时刻的 UTC 时间戳
