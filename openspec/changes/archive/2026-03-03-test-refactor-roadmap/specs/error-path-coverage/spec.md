# 错误路径覆盖测试规范

本规范定义系统中错误恢复路径和异常场景的测试要求，确保系统在出现错误时能够优雅降级或恢复。

## ADDED Requirements

### Requirement: 网络错误必须被捕获并返回友好消息
系统 SHALL 在网络请求失败时捕获错误并返回用户友好的错误消息。

#### Scenario: RSS feed 网络超时
- **WHEN** RSS feed 请求超时
- **THEN** 系统返回 "RSS feed request timed out" 错误

#### Scenario: API 请求网络错误
- **WHEN** fetch 请求因网络错误失败
- **THEN** 系统返回 "Network error during request" 错误

#### Scenario: DNS 解析失败
- **WHEN** URL 的 DNS 解析失败
- **THEN** 系统返回适当的错误消息

### Requirement: 数据库连接错误必须被捕获
系统 SHALL 在数据库连接失败时抛出可捕获的异常，不导致进程崩溃。

#### Scenario: 数据库未启动
- **WHEN** 尝试连接数据库但数据库服务未运行
- **THEN** 系统抛出 "Database connection failed" 错误

#### Scenario: 数据库连接池耗尽
- **WHEN** 所有连接都在使用中
- **THEN** 系统等待或抛出 "Connection pool exhausted" 错误

#### Scenario: 数据库连接中断
- **WHEN** 正在使用的连接突然中断
- **THEN** 系统捕获错误并尝试重连或返回错误

### Requirement: 数据库事务失败必须完整回滚
系统 SHALL 在事务中的任何操作失败时回滚所有更改，保持数据一致性。

#### Scenario: 插入 items 时部分失败
- **WHEN** 批量插入 items 时某个 item 违反约束
- **THEN** 系统回滚整个事务，不插入任何 item

#### Scenario: 更新 feed 和插入 items 失败
- **WHEN** 成功更新 feed.lastUpdatedAt 但插入 items 失败
- **THEN** 系统回滚 feed 的更新，保持一致性

#### Scenario: 级联删除失败
- **WHEN** 删除 feed 时级联删除 items 失败
- **THEN** 系统回滚 feed 的删除

### Requirement: 文件系统错误必须被优雅处理
系统 SHALL 在文件操作失败时返回错误而非崩溃。

#### Scenario: 读取配置文件失败
- **WHEN** 配置文件不存在或无法读取
- **THEN** 系统使用默认配置或返回错误

#### Scenario: 写入日志文件失败
- **WHEN** 无法写入日志文件
- **THEN** 系统输出到 stdout 或 stderr，不中断服务

### Requirement: 内存不足错误必须被处理
系统 SHALL 在内存分配失败时优雅降级，不导致 OOM 崩溃。

#### Scenario: 解析超大 RSS feed
- **WHEN** RSS feed 包含数千个 items
- **THEN** 系统分批处理或拒绝并返回错误

#### Scenario: 处理超大请求体
- **WHEN** POST 请求体超过内存限制
- **THEN** 系统返回 413 Payload Too Large

### Requirement: 并发修改冲突必须被检测和处理
系统 SHALL 在检测到并发修改冲突时返回适当的错误或重试。

#### Scenario: 乐观锁冲突
- **WHEN** 两个用户同时修改同一 feed
- **THEN** 系统返回 409 Conflict 或应用最后写入

#### Scenario: Rate Limit 竞态条件
- **WHEN** 多个请求同时检查和更新 Rate Limit 计数
- **THEN** 系统使用原子操作确保计数准确

### Requirement: 外部服务降级必须被处理
系统 SHALL 在外部服务（如 RSS parser）不可用时降级或返回错误。

#### Scenario: RSS parser 抛出异常
- **WHEN** rss-parser 库抛出未预期的异常
- **THEN** 系统捕获并返回 "Failed to parse RSS feed" 错误

#### Scenario: bcrypt 操作失败
- **WHEN** bcrypt 哈希或验证操作失败
- **THEN** 系统返回通用错误，不泄露敏感信息

### Requirement: JSON 解析错误必须被捕获
系统 SHALL 在 JSON 解析失败时返回明确的错误消息。

#### Scenario: API 响应不是有效 JSON
- **WHEN** API 返回非 JSON 响应（如 HTML 错误页面）
- **THEN** 系统返回 "Invalid JSON response" 错误

#### Scenario: JSON 结构不符合预期
- **WHEN** JSON 有效但缺少必需字段
- **THEN** 系统验证并返回字段缺失错误

### Requirement: 输入验证错误必须返回明确的字段名
系统 SHALL 在输入验证失败时指明哪个字段无效。

#### Scenario: URL 验证失败
- **WHEN** feedUrl 格式无效
- **THEN** 系统返回 "Invalid URL format for feedUrl" 错误

#### Scenario: 标题验证失败
- **WHEN** 标题为空或过长
- **THEN** 系统返回 "Title cannot be empty" 或 "Title too long" 错误

### Requirement: 资源不存在错误必须返回 404
系统 SHALL 在请求的资源不存在时返回 404 Not Found。

#### Scenario: Feed 不存在
- **WHEN** GET /api/feeds/999 但该 ID 不存在
- **THEN** 系统返回 404 和 "Feed not found" 错误

#### Scenario: Item 不存在
- **WHEN** GET /api/items/999 但该 ID 不存在
- **THEN** 系统返回 404 和 "Item not found" 错误

### Requirement: 权限错误必须返回 403 或 404
系统 SHALL 在用户无权访问资源时返回 403（明确资源存在但无权）或 404（隐藏资源存在性）。

#### Scenario: 访问其他用户的 feed
- **WHEN** 用户尝试访问其他用户的 feed
- **THEN** 系统返回 403 Forbidden

#### Scenario: 列表过滤其他用户的资源
- **WHEN** 用户的列表查询尝试包含其他用户的资源
- **THEN** 系统自动过滤，不返回错误

### Requirement: Rate Limit 超出必须返回 429
系统 SHALL 在请求超过速率限制时返回 429 Too Many Requests。

#### Scenario: 超过 Rate Limit
- **WHEN** IP 在 1 分钟内超过 5 个请求
- **THEN** 系统返回 429 和 Retry-After header

#### Scenario: Rate Limit 重置后允许请求
- **WHEN** 时间窗口重置后再次请求
- **THEN** 系统正常处理请求

### Requirement: 无效操作必须返回 400
系统 SHALL 在请求格式正确但逻辑上无效时返回 400 Bad Request。

#### Scenario: 创建重复的 feed
- **WHEN** 创建已存在的 feed
- **THEN** 系统返回 400 和 "此订阅已存在" 错误

#### Scenario: 标记已读的 item 再次标记
- **WHEN** 标记一个已读的 item 为已读
- **THEN** 系统返回成功（幂等操作）或 400

### Requirement: 异步操作错误必须被传播
系统 SHALL 在异步操作失败时不静默失败，而是传播错误。

#### Scenario: 后台 RSS 刷新失败
- **WHEN** RSS worker 刷新 feed 失败
- **THEN** 系统记录错误并可选择通知用户

#### Scenario: 异步数据库写入失败
- **WHEN** 异步写入数据库失败
- **THEN** 系统捕获并处理错误，不导致未处理的 Promise rejection

### Requirement: 重试机制必须处理永久失败
系统 SHALL 在重试操作时检测永久失败并停止重试。

#### Scenario: 404 错误不重试
- **WHEN** 请求返回 404
- **THEN** 系统不重试，立即返回错误

#### Scenario: 4xx 错误有限重试
- **WHEN** 请求返回 429
- **THEN** 系统有限重试（如 3 次），然后返回错误

#### Scenario: 5xx 错误指数退避重试
- **WHEN** 请求返回 500
- **THEN** 系统使用指数退避策略重试

### Requirement: 错误日志必须包含上下文信息
系统 SHALL 在记录错误时包含足够的上下文以便调试。

#### Scenario: 记录错误堆栈
- **WHEN** 捕获异常
- **THEN** 日志包含错误堆栈、文件名和行号

#### Scenario: 记录请求上下文
- **WHEN** 请求处理失败
- **THEN** 日志包含请求 ID、用户 ID、IP 和相关参数

#### Scenario: 记录时间戳
- **WHEN** 错误发生
- **THEN** 日志包含精确的时间戳

### Requirement: 未预期的错误必须返回 500
系统 SHALL 在发生未预期错误时返回 500 Internal Server Error。

#### Scenario: 未捕获的异常
- **WHEN** 代码抛出未预期的异常
- **THEN** 系统返回 500 和通用错误消息

#### Scenario: 开发环境返回详细错误
- **WHEN** 在开发环境发生 500 错误
- **THEN** 系统返回错误堆栈和详细信息

#### Scenario: 生产环境隐藏详细信息
- **WHEN** 在生产环境发生 500 错误
- **THEN** 系统返回通用错误，不暴露内部细节

### Requirement: 资源清理必须在错误后执行
系统 SHALL 在发生错误后正确清理资源（连接、句柄等）。

#### Scenario: 数据库连接清理
- **WHEN** 操作失败
- **THEN** 系统释放数据库连接回连接池

#### Scenario: 文件句柄清理
- **WHEN** 文件操作失败
- **THEN** 系统关闭文件句柄，不泄漏资源

#### Scenario: 定时器清理
- **WHEN** 异步操作失败
- **THEN** 系统清除相关的定时器

### Requirement: 错误恢复必须支持部分成功
系统 SHALL 在批量操作中部分失败时报告成功和失败的部分。

#### Scenario: 批量刷新部分失败
- **WHEN** 刷新 10 个 feeds，其中 2 个失败
- **THEN** 系统返回成功和失败的详情

#### Scenario: 批量删除部分失败
- **WHEN** 删除多个 items，部分 items 不存在或已删除
- **THEN** 系统报告成功和失败的数量
