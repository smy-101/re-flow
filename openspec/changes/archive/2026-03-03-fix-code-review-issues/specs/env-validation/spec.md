## ADDED Requirements

### Requirement: 环境变量验证

系统 SHALL 在应用启动时验证所有必需的环境变量，如果缺失则终止应用启动。

#### Scenario: 验证成功
- **WHEN** 所有必需的环境变量都已设置
- **THEN** 应用正常启动
- **AND** 验证函数不抛出错误

#### Scenario: JWT_SECRET 缺失
- **WHEN** JWT_SECRET 环境变量未设置
- **THEN** 应用在启动时终止
- **AND** 错误消息明确指出缺少 JWT_SECRET
- **AND** 进程退出码为 1

#### Scenario: JWT_SECRET 为空字符串
- **WHEN** JWT_SECRET 环境变量设置为空字符串
- **THEN** 应用在启动时终止
- **AND** 错误消息指出 JWT_SECRET 不能为空

#### Scenario: CRON_SECRET 缺失
- **WHEN** CRON_SECRET 环境变量未设置
- **THEN** 应用在启动时终止
- **AND** 错误消息明确指出缺少 CRON_SECRET

#### Scenario: 验证时机
- **WHEN** 应用启动
- **THEN** 在处理任何请求之前验证环境变量
- **AND** 验证失败时立即终止，不继续启动
