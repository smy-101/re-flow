# User Authentication Spec (Delta)

## MODIFIED Requirements

### Requirement: Login credential validation

系统 SHALL 验证用户提供的邮箱和密码是否匹配数据库中存储的凭证。

#### Scenario: Valid credentials
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

## REMOVED Requirements

### Requirement: (原 Username 相关场景)

**Reason**: 登录凭证从用户名改为邮箱

**Migration**: API 请求参数从 `username` 改为 `email`，错误信息从 "用户名或密码错误" 改为 "邮箱或密码错误"
