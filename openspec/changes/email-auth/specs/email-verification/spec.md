# Email Verification Spec

## ADDED Requirements

### Requirement: Verification code generation

系统 SHALL 生成 6 位数字验证码，用于邮箱验证。

#### Scenario: Code generation
- **WHEN** 系统生成验证码
- **THEN** 验证码为 6 位纯数字字符串（000000-999999）

### Requirement: Verification code sending

系统 SHALL 通过邮件发送验证码到指定邮箱，验证码 10 分钟内有效。

#### Scenario: Send verification code
- **WHEN** 用户请求发送验证码（邮箱有效且未达到发送限制）
- **THEN** 系统生成验证码、发送邮件、并存储验证码记录

#### Scenario: Send rate limit
- **WHEN** 同一邮箱在 60 秒内重复请求发送验证码
- **THEN** 系统返回 429 状态码和错误信息 "验证码已发送，请 60 秒后重试"，并返回剩余等待时间

### Requirement: Verification code validation

系统 SHALL 验证用户提交的验证码是否正确且未过期。

#### Scenario: Valid verification code
- **WHEN** 用户提交正确的验证码且未过期
- **THEN** 系统验证通过，并删除该邮箱该类型的所有验证码

#### Scenario: Expired verification code
- **WHEN** 用户提交已过期的验证码（超过 10 分钟）
- **THEN** 系统返回 400 状态码和错误信息 "验证码已过期，请重新获取"

#### Scenario: Invalid verification code
- **WHEN** 用户提交错误的验证码
- **THEN** 系统返回 400 状态码和错误信息 "验证码错误"

### Requirement: Verification attempt rate limiting

系统 SHALL 对验证码校验实施组合频率限制。

#### Scenario: Email rate limit exceeded
- **WHEN** 同一邮箱在 15 分钟内验证失败超过 5 次
- **THEN** 系统返回 429 状态码和错误信息 "验证次数过多，请 15 分钟后重试"

#### Scenario: IP rate limit exceeded
- **WHEN** 同一 IP 在 15 分钟内验证失败超过 10 次
- **THEN** 系统返回 429 状态码和错误信息 "验证次数过多，请 15 分钟后重试"

### Requirement: Verification code storage

系统 SHALL 将验证码存储在数据库中，包含邮箱、验证码、类型、创建时间和过期时间。

#### Scenario: Code storage
- **WHEN** 系统生成验证码
- **THEN** 验证码记录包含 email、code、type（register/reset_password）、createdAt、expiresAt（10 分钟后）

### Requirement: Verification code cleanup

系统 SHALL 在验证成功后删除该邮箱该类型的所有验证码记录。

#### Scenario: Cleanup on success
- **WHEN** 验证码验证成功
- **THEN** 系统删除该邮箱该类型的所有验证码记录（包括过期和未使用的）
