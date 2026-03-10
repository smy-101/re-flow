# Password Reset Spec

## ADDED Requirements

### Requirement: Password reset request

系统 SHALL 允许用户通过邮箱请求重置密码，并发送验证码到该邮箱。

#### Scenario: Request reset for existing email
- **WHEN** 用户提交已注册的邮箱请求重置密码
- **THEN** 系统发送验证码到该邮箱

#### Scenario: Request reset for non-existing email
- **WHEN** 用户提交未注册的邮箱请求重置密码
- **THEN** 系统仍返回成功（安全考虑，不暴露邮箱是否存在）

### Requirement: Password reset with verification code

系统 SHALL 允许用户通过验证码重置密码。

#### Scenario: Reset password with valid code
- **WHEN** 用户提交正确的验证码和新密码
- **THEN** 系统更新用户密码，删除验证码，返回成功

#### Scenario: Reset password with invalid code
- **WHEN** 用户提交错误的验证码
- **THEN** 系统返回 400 状态码和错误信息 "验证码错误"

#### Scenario: Reset password with expired code
- **WHEN** 用户提交已过期的验证码
- **THEN** 系统返回 400 状态码和错误信息 "验证码已过期，请重新获取"

### Requirement: New password validation

系统 SHALL 验证新密码符合密码规则（至少 8 个字符）。

#### Scenario: Valid new password
- **WHEN** 用户提交至少 8 个字符的新密码
- **THEN** 系统接受该密码并完成重置

#### Scenario: New password too short
- **WHEN** 用户提交少于 8 个字符的新密码
- **THEN** 系统返回 400 状态码和错误信息 "密码至少需要 8 个字符"

### Requirement: Password reset rate limiting

系统 SHALL 对密码重置请求实施频率限制。

#### Scenario: Reset request rate limit
- **WHEN** 同一邮箱在 60 秒内重复请求重置密码
- **THEN** 系统返回 429 状态码和错误信息 "请求过于频繁，请稍后再试"
