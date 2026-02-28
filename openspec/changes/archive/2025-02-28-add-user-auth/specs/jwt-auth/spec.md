# JWT Authentication Spec

## ADDED Requirements

### Requirement: JWT token generation

系统 SHALL 使用 jose 库生成 JWT 令牌，包含用户 ID 和过期时间。

#### Scenario: Token generation
- **WHEN** 用户登录验证成功
- **THEN** 系统生成包含用户 ID（sub）、签发时间（iat）、过期时间（exp）的 JWT

### Requirement: JWT signing

系统 SHALL 使用 HS256 算法和密钥签名 JWT，密钥存储在环境变量中。

#### Scenario: Token signing
- **WHEN** 系统生成 JWT
- **THEN** 使用 HS256 算法和 `JWT_SECRET` 环境变量密钥签名

### Requirement: JWT expiration

系统 SHALL 设置 JWT 过期时间为 7 天。

#### Scenario: Token expiration
- **WHEN** JWT 超过 7 天
- **THEN** 系统拒绝该令牌并要求重新登录

### Requirement: JWT validation

系统 SHALL 在每个需要认证的请求中验证 JWT 的签名和过期时间。

#### Scenario: Valid JWT
- **WHEN** 请求包含有效且未过期的 JWT
- **THEN** 系统解析用户 ID 并允许访问

#### Scenario: Invalid JWT signature
- **WHEN** 请求包含签名无效的 JWT
- **THEN** 系统返回 401 状态码并重定向到登录页面

#### Scenario: Expired JWT
- **WHEN** 请求包含已过期的 JWT
- **THEN** 系统返回 401 状态码并重定向到登录页面

#### Scenario: Missing JWT
- **WHEN** 请求不包含 JWT 且访问受保护路由
- **THEN** 系统返回 401 状态码并重定向到登录页面

### Requirement: JWT storage

系统 SHALL 使用 HTTP-only Cookie 存储 JWT 令牌。

#### Scenario: Cookie security
- **WHEN** 系统设置 JWT Cookie
- **THEN** Cookie 标记为 HTTP-only、Secure、SameSite=Strict

### Requirement: JWT logout

系统 SHALL 在登出时清除客户端的 JWT Cookie。

#### Scenario: Logout
- **WHEN** 用户请求登出
- **THEN** 系统清除 JWT Cookie 并重定向到首页

#### Scenario: Logout without JWT
- **WHEN** 未登录用户请求登出
- **THEN** 系统重定向到首页（无操作）

### Requirement: Token refresh

系统 SHALL 支持在令牌即将过期时签发新令牌（可选功能）。

#### Scenario: Token refresh
- **WHEN** 用户在令牌有效期内进行操作且令牌接近过期
- **THEN** 系统可以签发新的 JWT 延长会话（未来实现）

### Requirement: Concurrent sessions

系统 SHALL 允许同一用户拥有多个有效的 JWT（如多设备登录）。

#### Scenario: Multiple concurrent tokens
- **WHEN** 同一用户在不同设备上登录
- **THEN** 系统为每个设备签发独立的 JWT，互不影响

#### Scenario: Logout from one device
- **WHEN** 用户在一个设备上登出
- **THEN** 系统仅清除该设备的 Cookie，其他设备的 JWT 保持有效
