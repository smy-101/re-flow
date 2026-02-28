# User Authentication Spec

## ADDED Requirements

### Requirement: Login credential validation

系统 SHALL 验证用户提供的用户名和密码是否匹配数据库中存储的凭证。

#### Scenario: Valid credentials
- **WHEN** 用户提交正确的用户名和密码
- **THEN** 系统验证通过并创建会话

#### Scenario: Invalid username
- **WHEN** 用户提交不存在的用户名
- **THEN** 系统返回 401 状态码和错误信息 "用户名或密码错误"

#### Scenario: Invalid password
- **WHEN** 用户提交存在的用户名但密码错误
- **THEN** 系统返回 401 状态码和错误信息 "用户名或密码错误"

#### Scenario: Missing credentials
- **WHEN** 用户未提供用户名或密码
- **THEN** 系统返回 400 状态码和错误信息 "请提供用户名和密码"

### Requirement: JWT creation after login

系统 SHALL 在登录验证成功后签发 JWT，并使用 HTTP-only Cookie 存储令牌。

#### Scenario: JWT creation
- **WHEN** 用户登录验证成功
- **THEN** 系统签发 JWT，并通过 HTTP-only Cookie 返回给客户端

#### Scenario: JWT cookie security
- **WHEN** 系统设置 JWT Cookie
- **THEN** Cookie 标记为 HTTP-only、Secure、SameSite=Strict

### Requirement: Login rate limiting

系统 SHALL 对登录请求实施速率限制，防止暴力破解攻击。

#### Scenario: Rate limit exceeded
- **WHEN** 同一 IP 地址在 1 分钟内尝试登录超过 5 次
- **THEN** 系统返回 429 状态码和错误信息 "请求过于频繁，请稍后再试"

### Requirement: User logout

系统 SHALL 提供登出功能，清除客户端的 JWT Cookie。

#### Scenario: Successful logout
- **WHEN** 已登录用户请求登出
- **THEN** 系统清除 JWT Cookie，并重定向到首页

#### Scenario: Logout without JWT
- **WHEN** 未登录用户请求登出
- **THEN** 系统重定向到首页（无操作）
