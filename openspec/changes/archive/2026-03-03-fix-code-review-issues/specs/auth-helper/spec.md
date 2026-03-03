## ADDED Requirements

### Requirement: 认证辅助函数

系统 SHALL 提供统一的认证辅助函数，用于验证用户身份并提取用户 ID。

#### Scenario: 成功获取已认证用户 ID
- **WHEN** 请求包含有效的 JWT token
- **THEN** 系统返回用户 ID（number 类型）

#### Scenario: Token 缺失
- **WHEN** 请求的 cookie 中没有 token
- **THEN** 系统返回 401 状态码的 NextResponse 对象
- **AND** 错误消息为 "Authentication required"

#### Scenario: Token 无效
- **WHEN** 请求的 token 已过期或签名无效
- **THEN** 系统返回 401 状态码的 NextResponse 对象
- **AND** 错误消息为 "Invalid token"

#### Scenario: 可选的 request 参数
- **WHEN** 调用辅助函数时提供 NextRequest 对象
- **THEN** 系统支持从 request 对象获取 cookie（扩展性）
- **AND** 默认使用全局 cookies() API
