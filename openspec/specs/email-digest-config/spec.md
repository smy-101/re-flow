# email-digest-config Specification

## Purpose
TBD - created by archiving change email-digest. Update Purpose after archive.
## Requirements
### Requirement: 用户可配置邮件推送开关

系统 SHALL 允许已验证邮箱的用户开启或关闭邮件推送功能。

#### Scenario: 开启推送功能
- **WHEN** 用户邮箱已验证且用户开启推送开关
- **THEN** 系统创建默认配置（每日 08:00 UTC，全部订阅源）

#### Scenario: 未验证邮箱无法开启
- **WHEN** 用户邮箱未验证且用户尝试开启推送
- **THEN** 系统拒绝并提示"请先验证邮箱"

### Requirement: 用户可配置推送频率

系统 SHALL 允许用户选择推送频率：每日、每周或自定义天数。

#### Scenario: 设置每日推送
- **WHEN** 用户选择"每日"频率
- **THEN** 系统设置 frequency=daily，时间窗口为 24 小时

#### Scenario: 设置每周推送
- **WHEN** 用户选择"每周"频率
- **THEN** 系统设置 frequency=weekly，时间窗口为 7 天

#### Scenario: 设置自定义天数
- **WHEN** 用户选择"每 N 天"并输入 N（1-30）
- **THEN** 系统设置 frequency=custom，customDays=N，时间窗口为 N 天

### Requirement: 用户可配置发送时间和时区

系统 SHALL 允许用户设置发送时间（HH:mm）和时区。

#### Scenario: 设置发送时间
- **WHEN** 用户设置发送时间为 08:00，时区为 Asia/Shanghai
- **THEN** 系统存储配置并计算下次发送时间（北京时间 08:00 对应的 UTC 时间戳）

#### Scenario: 时区计算
- **WHEN** Worker 检查是否有配置需要发送
- **THEN** 系统按用户时区计算当前时间，与 sendTime 比较决定是否发送

### Requirement: 用户可配置推送后标记已读

系统 SHALL 允许用户选择推送后是否自动标记文章为已读。

#### Scenario: 启用自动标记已读
- **WHEN** 用户开启"推送后标记已读"且邮件发送成功
- **THEN** 系统将本次推送的所有文章标记为已读

#### Scenario: 禁用自动标记已读
- **WHEN** 用户关闭"推送后标记已读"且邮件发送成功
- **THEN** 系统保持文章未读状态不变

### Requirement: 用户可配置筛选规则

系统 SHALL 允许用户选择推送全部订阅或指定分类/订阅源。

#### Scenario: 推送全部订阅
- **WHEN** 用户选择"全部订阅"
- **THEN** 系统创建 filterType=all 的筛选规则

#### Scenario: 按分类筛选
- **WHEN** 用户选择特定分类（如"技术"、"设计"）
- **THEN** 系统创建 filterType=category，filterValue=分类名 的筛选规则

#### Scenario: 按订阅源筛选
- **WHEN** 用户选择特定订阅源
- **THEN** 系统创建 filterType=feed，filterValue=feed_id 的筛选规则

### Requirement: 连续失败自动暂停

系统 SHALL 在连续发送失败 3 次后自动暂停该用户的推送。

#### Scenario: 连续失败达到阈值
- **WHEN** 配置的 consecutiveFailures 达到 3
- **THEN** 系统设置 pausedDueToFailures=true，停止后续发送

#### Scenario: 用户重新启用
- **WHEN** 用户在设置页面重新启用已暂停的推送
- **THEN** 系统重置 consecutiveFailures=0，pausedDueToFailures=false

