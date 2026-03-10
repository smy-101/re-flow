# User Registration Spec (Delta)

## MODIFIED Requirements

### Requirement: Email validation

系统 SHALL 在用户注册时验证邮箱符合以下规则：
- 符合标准邮箱格式
- 邮箱必须唯一

#### Scenario: Valid email
- **WHEN** 用户提交有效的邮箱（符合格式且未被注册）
- **THEN** 系统接受该邮箱并继续处理注册请求

#### Scenario: Invalid email format
- **WHEN** 用户提交无效的邮箱格式
- **THEN** 系统返回错误信息 "邮箱格式不正确"

#### Scenario: Duplicate email
- **WHEN** 用户提交已注册的邮箱
- **THEN** 系统返回错误信息 "该邮箱已被注册"

### Requirement: Nickname handling

系统 SHALL 将 nickname 作为可选的显示名称处理：
- nickname 可重复，不需要唯一
- 若未提供 nickname，默认使用邮箱前缀（@ 之前的部分）

#### Scenario: Registration with nickname
- **WHEN** 用户提交自定义 nickname
- **THEN** 系统使用用户提供的 nickname

#### Scenario: Registration without nickname
- **WHEN** 用户未提供 nickname
- **THEN** 系统使用邮箱前缀作为默认 nickname（如 alice@example.com → alice）

### Requirement: Registration with verification code

系统 SHALL 要求用户在注册时提供有效的邮箱验证码。

#### Scenario: Registration with valid code
- **WHEN** 用户提交有效的邮箱、密码和正确的验证码
- **THEN** 系统创建用户账户，标记邮箱已验证，返回成功

#### Scenario: Registration with invalid code
- **WHEN** 用户提交错误的验证码
- **THEN** 系统返回 400 状态码和错误信息 "验证码错误"

#### Scenario: Registration with expired code
- **WHEN** 用户提交已过期的验证码
- **THEN** 系统返回 400 状态码和错误信息 "验证码已过期，请重新获取"

### Requirement: User account creation

系统 SHALL 在验证通过后创建用户账户，包含 email、nickname（默认邮箱前缀）、passwordHash、emailVerified 字段。

#### Scenario: Successful registration
- **WHEN** 用户提交有效的邮箱、密码和验证码
- **THEN** 系统创建用户账户，emailVerified 设为 true，返回 201 状态码

## REMOVED Requirements

### Requirement: Username validation

**Reason**: 登录凭证从用户名改为邮箱，username 改为可选的 nickname（可重复）

**Migration**: 现有 username 字段改名为 nickname，新用户 nickname 默认取邮箱前缀
