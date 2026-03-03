# API 路由安全测试规范

本规范定义 API 路由的输入验证、授权检查、错误处理和安全测试要求。

## ADDED Requirements

### Requirement: API 路由必须拒绝过期的 JWT 令牌
系统 SHALL 在 JWT 令牌过期时返回 401 Unauthorized。

#### Scenario: 过期令牌访问保护资源
- **WHEN** 使用过期的 JWT 访问 /api/feeds
- **THEN** 系统返回 401 状态码和 "Invalid token" 错误消息

#### Scenario: 过期令牌访问创建资源
- **WHEN** 使用过期的 JWT POST 到 /api/feeds
- **THEN** 系统返回 401 状态码

### Requirement: API 路由必须处理缺失的 Cookie
系统 SHALL 在请求不包含认证 Cookie 时返回 401。

#### Scenario: 无 Cookie 访问
- **WHEN** 请求不包含认证 Cookie
- **THEN** 系统返回 401 和 "Authentication required" 错误消息

#### Scenario: Cookie 为空字符串
- **WHEN** Cookie 存在但值为空字符串
- **THEN** 系统返回 401

### Requirement: API 路由必须处理多个 Cookie 冲突
系统 SHALL 在存在多个认证 Cookie 时使用第一个有效的。

#### Scenario: 多个 Cookie 只有第一个有效
- **WHEN** 请求包含多个 token Cookie，只有第一个有效
- **THEN** 系统使用第一个 Cookie 并返回 200

#### Scenario: 所有 Cookie 都无效
- **WHEN** 请求包含多个 token Cookie，所有都无效
- **THEN** 系统返回 401

### Requirement: API 路由必须验证 JSON 请求体
系统 SHALL 在请求体不是有效 JSON 时返回 400 错误。

#### Scenario: 无效的 JSON
- **WHEN** POST 请求体是格式错误的 JSON
- **THEN** 系统返回 400 和 "Invalid JSON" 错误消息

#### Scenario: 非 JSON Content-Type
- **WHEN** 请求 Content-Type 不是 application/json
- **THEN** 系统仍尝试解析，或返回 415 Unsupported Media Type

### Requirement: API 路由必须验证必需字段
系统 SHALL 在请求体缺少必需字段时返回 400。

#### Scenario: 创建 feed 缺少 feedUrl
- **WHEN** POST /api/feeds 时 body 不包含 feedUrl
- **THEN** 系统返回 400 和 "feedUrl is required" 错误

#### Scenario: 更新 feed 只有可选字段
- **WHEN** PUT /api/feeds/1 时 body 只包含可选字段
- **THEN** 系统正常处理（不返回 400）

### Requirement: API 路由必须防止 SQL 注入
系统 SHALL 在使用用户输入构造数据库查询时使用参数化查询。

#### Scenario: feedUrl 包含 SQL 注入尝试
- **WHEN** feedUrl 为 "'; DROP TABLE feeds; --"
- **THEN** 系统将其视为普通字符串，不执行 SQL

#### Scenario: 标题包含引号
- **WHEN** 标题为 "Test'; DROP TABLE users; --"
- **THEN** 系统安全存储，不执行注入

### Requirement: API 路由必须防止 XSS 攻击
系统 SHALL 在返回用户输入的内容时进行转义或使用安全编码。

#### Scenario: 标题包含 script 标签
- **WHEN** feed 标题为 "<script>alert('xss')</script>"
- **THEN** 系统在 JSON 响应中安全编码，不执行脚本

#### Scenario: 内容包含事件处理器
- **WHEN** item 内容包含 "onload='malicious()'"
- **THEN** 系统安全存储和返回

### Requirement: API 路由必须拒绝超长字符串
系统 SHALL 在输入字段超过合理长度时返回 400。

#### Scenario: 超长 feedUrl
- **WHEN** feedUrl 长度超过 2048 字符
- **THEN** 系统返回 400 和 "URL too long" 错误

#### Scenario: 超长标题
- **WHEN** 标题长度超过 500 字符
- **THEN** 系统返回 400 和 "Title too long" 错误

### Requirement: API 路由必须验证 URL 格式
系统 SHALL 在 URL 字段格式无效时返回 400。

#### Scenario: 无效的 URL 格式
- **WHEN** feedUrl 为 "not-a-url"
- **THEN** 系统返回 400 和 "Invalid URL format" 错误

#### Scenario: 缺少协议的 URL
- **WHEN** feedUrl 为 "example.com/feed.xml"（缺少 http/https）
- **THEN** 系统返回 400 或自动添加协议

### Requirement: API 路由必须处理并发创建相同资源
系统 SHALL 在并发请求创建相同 feed 时正确处理，不创建重复。

#### Scenario: 并发创建相同 feed
- **WHEN** 两个请求同时创建相同 feedUrl 的 feed
- **THEN** 只有一个成功，另一个返回 409 Conflict 或 400 "此订阅已存在"

#### Scenario: 数据库唯一约束冲突
- **WHEN** 插入时违反数据库唯一约束
- **THEN** 系统捕获错误并返回友好的错误消息

### Requirement: API 路由必须拒绝删除不存在的资源
系统 SHALL 在尝试删除不存在的资源时返回 404。

#### Scenario: 删除不存在的 feed
- **WHEN** DELETE /api/feeds/999999
- **THEN** 系统返回 404 和 "Feed not found" 错误

#### Scenario: 删除已删除的 feed
- **WHEN** 重复删除同一 feed
- **THEN** 系统返回 404

### Requirement: API 路由必须拒绝更新只读字段
系统 SHALL 忽略或拒绝用户尝试更新的只读字段。

#### Scenario: 尝试更新 feedId
- **WHEN** PUT /api/feeds/1 时 body 包含 id 字段
- **THEN** 系统忽略 id 字段，使用 URL 中的 ID

#### Scenario: 尝试更新 userId
- **WHEN** PUT /api/feeds/1 时 body 包含 userId 字段
- **THEN** 系统拒绝或忽略 userId 字段

### Requirement: API 路由必须防止跨用户访问
系统 SHALL 确保用户只能访问自己的资源，不能访问其他用户的资源。

#### Scenario: 访问其他用户的 feed
- **WHEN** 用户 A 尝试 GET /api/feeds/999（属于用户 B）
- **THEN** 系统返回 403 Forbidden 或 404 Not Found

#### Scenario: 修改其他用户的 feed
- **WHEN** 用户 A 尝试 PUT /api/feeds/999（属于用户 B）
- **THEN** 系统返回 403 Forbidden

#### Scenario: 删除其他用户的 feed
- **WHEN** 用户 A 尝试 DELETE /api/feeds/999（属于用户 B）
- **THEN** 系统返回 403 Forbidden

### Requirement: API 路由必须处理数据库错误
系统 SHALL 在数据库操作失败时返回 500 而不崩溃。

#### Scenario: 数据库连接失败
- **WHEN** 数据库不可用
- **THEN** 系统返回 500 和 "Database error" 消息

#### Scenario: 数据库查询超时
- **WHEN** 数据库查询超过超时时间
- **THEN** 系统返回 503 Service Unavailable 或 500

#### Scenario: 违反外键约束
- **WHEN** 操作违反外键约束
- **THEN** 系统返回 400 或 500，包含约束错误信息

### Requirement: API 路由必须正确设置 HTTP 状态码
系统 SHALL 根据操作结果使用正确的 HTTP 状态码。

#### Scenario: 成功 GET 返回 200
- **WHEN** GET 请求成功
- **THEN** 系统返回 200

#### Scenario: 成功 POST 返回 201
- **WHEN** POST 请求创建成功
- **THEN** 系统返回 201 和 Location header

#### Scenario: 成功 PUT 返回 200
- **WHEN** PUT 请求更新成功
- **THEN** 系统返回 200

#### Scenario: 成功 DELETE 返回 204
- **WHEN** DELETE 请求成功
- **THEN** 系统返回 204 且无响应体

### Requirement: API 路由必须包含安全的错误消息
系统 SHALL 在错误响应中不泄露敏感信息（如内部路径、数据库结构）。

#### Scenario: 数据库错误不泄露细节
- **WHEN** 发生数据库错误
- **THEN** 系统返回通用错误消息，不包含表名、列名或 SQL 查询

#### Scenario: 内部错误不暴露堆栈
- **WHEN** 发生未捕获异常
- **THEN** 系统在开发环境返回堆栈，在生产环境返回通用消息

### Requirement: API 路由必须验证 CRON_SECRET
系统 SHALL 在访问内部端点时验证 CRON_SECRET header。

#### Scenario: 缺少 CRON_SECRET
- **WHEN** POST /api/feeds/refresh-all 不包含 x-cron-secret header
- **THEN** 系统返回 401 Unauthorized

#### Scenario: 错误的 CRON_SECRET
- **WHEN** x-cron-secret header 值不正确
- **THEN** 系统返回 403 Forbidden

#### Scenario: 正确的 CRON_SECRET
- **WHEN** x-cron-secret header 值正确
- **THEN** 系统处理请求

### Requirement: API 路由必须限制批量操作大小
系统 SHALL 在批量操作时限制单次处理的项目数量。

#### Scenario: 批量刷新超过限制
- **WHEN** 请求批量刷新超过 100 个 feeds
- **THEN** 系统返回 400 或分批处理

#### Scenario: 批量删除超过限制
- **WHEN** 请求批量删除超过 50 个 items
- **THEN** 系统返回 400 或分批处理

### Requirement: API 路由必须处理分页参数
系统 SHALL 在支持分页的端点验证和处理分页参数。

#### Scenario: 无效的页码
- **WHEN** page 参数为负数或 0
- **THEN** 系统使用默认值 1 或返回 400

#### Scenario: 无效的每页数量
- **WHEN** limit 参数超过 100 或为负数
- **THEN** 系统使用默认值或返回 400

#### Scenario: 偏移量超过结果总数
- **WHEN** offset 参数大于可用结果数
- **THEN** 系统返回空数组而非 404

### Requirement: API 路由必须支持 CORS 预检请求
系统 SHALL 正确响应 OPTIONS 请求。

#### Scenario: CORS 预检请求
- **WHEN** 发送 OPTIONS 请求
- **THEN** 系统返回 204 和适当的 CORS headers

### Requirement: API 路由必须记录安全相关事件
系统 SHALL 记录认证失败、授权失败和可疑活动。

#### Scenario: 记录失败的认证尝试
- **WHEN** JWT 验证失败
- **THEN** 系统记录 IP、时间戳和失败原因

#### Scenario: 记录拒绝的授权尝试
- **WHEN** 用户尝试访问其他用户的资源
- **THEN** 系统记录用户 ID、目标资源和时间戳

#### Scenario: 记录 Rate Limit 触发
- **WHEN** IP 触发 Rate Limit
- **THEN** 系统记录 IP 和触发时间
