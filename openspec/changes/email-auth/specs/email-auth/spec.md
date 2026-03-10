# Email Auth Spec

## ADDED Requirements

### Requirement: Email login credential validation

系统 SHALL 使用邮箱和密码验证用户身份，邮箱作为唯一登录凭证。

#### Scenario: Valid email and password
- **WHEN** 用户提交正确的邮箱和密码
- **THEN** 系统验证通过并创建会话

#### Scenario: Invalid email
- **WHEN** 用户提交不存在的邮箱
- **THEN** 系统返回 401 状态码和错误信息 "邮箱或密码错误"

#### Scenario: Invalid password
- **WHEN** 用户提交存在的邮箱但密码错误
- **THEN** 系统返回 401 状态码和错误信息 "邮箱或密码错误"

#### Scenario: Missing credentials
- **WHEN** 用户未提供邮箱或密码
- **THEN** 系统返回 400 状态码和错误信息 "请提供邮箱和密码"

### Requirement: Email format validation

系统 SHALL 验证登录邮箱格式符合标准邮箱格式。

#### Scenario: Invalid email format
- **WHEN** 用户提交无效的邮箱格式
- **THEN** 系统返回 400 状态码和错误信息 "邮箱格式不正确"

### Requirement: JWT creation after email login

系统 SHALL 在邮箱登录验证成功后签发 JWT，并使用 HTTP-only Cookie 存储令牌。

#### Scenario: JWT creation on email login
- **WHEN** 用户使用邮箱登录验证成功
- **THEN** 系统签发 JWT，并通过 HTTP-only Cookie 返回给客户端

### Requirement: Login rate limiting

系统 SHALL 对登录请求实施速率限制，防止暴力破解攻击。

#### Scenario: Rate limit exceeded
- **WHEN** 同一 IP 地址在 1 分钟内尝试登录超过 5 次
- **THEN** 系统返回 429 状态码和错误信息 "请求过于频繁，请稍后再试"
