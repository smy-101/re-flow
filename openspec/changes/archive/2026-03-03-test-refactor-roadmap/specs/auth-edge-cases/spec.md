# 认证边缘情况测试规范

本规范定义认证模块（JWT、密码哈希、Rate Limit、IP 提取）的边缘情况和安全性测试要求。

## ADDED Requirements

### Requirement: JWT 验证必须拒绝过期令牌
系统 SHALL 在令牌的 exp 字段小于当前时间时返回 null。

#### Scenario: 过期令牌返回 null
- **WHEN** 验证一个 exp 字段为过去的 JWT
- **THEN** 系统返回 null

#### Scenario: 刚过期的令牌被拒绝
- **WHEN** 令牌在 1 毫秒前过期
- **THEN** 系统返回 null

### Requirement: JWT 验证必须拒绝签名不匹配的令牌
系统 SHALL 在令牌签名与密钥不匹配时返回 null。

#### Scenario: 篡改的令牌被拒绝
- **WHEN** 令牌的 payload 被修改导致签名无效
- **THEN** 系统返回 null

#### Scenario: 使用错误密钥签名的令牌被拒绝
- **WHEN** 令牌使用不同的 JWT_SECRET 签名
- **THEN** 系统返回 null

### Requirement: JWT 验证必须处理格式错误的令牌
系统 SHALL 在令牌不符合 JWT 格式（三部分用点分隔）时返回 null。

#### Scenario: 空字符串令牌返回 null
- **WHEN** 传入空字符串 ""
- **THEN** 系统返回 null

#### Scenario: 只有部分的令牌返回 null
- **WHEN** 令牌只有 1 或 2 部分（而非 3 部分）
- **THEN** 系统返回 null

#### Scenario: Base64 解码失败时返回 null
- **WHEN** 令牌的某部分不是有效的 Base64URL 编码
- **THEN** 系统返回 null

### Requirement: JWT 验证必须处理无效的 payload
系统 SHALL 在 payload 缺少必要字段或格式错误时返回 null。

#### Scenario: 缺少 sub 字段返回 null
- **WHEN** payload 不包含 sub 字段
- **THEN** 系统返回 null

#### Scenario: sub 字段不是数字时 getUserIdFromToken 返回 null
- **WHEN** payload.sub 为非数字字符串（如 "abc"）
- **THEN** getUserIdFromToken 返回 null

#### Scenario: 缺少 exp 或 iat 字段时返回 null
- **WHEN** payload 不包含 exp 或 iat 字段
- **THEN** 系统返回 null

### Requirement: JWT 必须正确处理极端的 userId 值
系统 SHALL 在签名和验证时正确处理边界值的 userId。

#### Scenario: 处理 userId 为 0
- **WHEN** 使用 userId = 0 签名令牌
- **THEN** 系统成功生成令牌并能正确解析回 0

#### Scenario: 处理负数 userId
- **WHEN** 使用负数 userId 签名令牌
- **THEN** 系统成功生成令牌并能正确解析回该负数

#### Scenario: 处理 MAX_SAFE_INTEGER
- **WHEN** 使用 Number.MAX_SAFE_INTEGER 作为 userId
- **THEN** 系统成功生成令牌并能正确解析

#### Scenario: 处理大整数 userId
- **WHEN** userId 超过 JavaScript 安全整数范围
- **THEN** 系统仍能正确处理（BigInt 或字符串表示）

### Requirement: 密码哈希必须拒绝空密码
系统 SHALL 在传入空字符串或 undefined 时正确处理。

#### Scenario: 空字符串哈希生成
- **WHEN** 传入空字符串 "" 作为密码
- **THEN** 系统生成有效的 bcrypt 哈希（不抛出异常）

#### Scenario: undefined 密码抛出错误
- **WHEN** 传入 undefined 作为密码
- **THEN** bcrypt 抛出异常

#### Scenario: 验证空字符串密码
- **WHEN** 用空字符串 "" 与哈希对比
- **THEN** 系统返回 false（除非哈希也是空字符串的哈希）

### Requirement: 密码哈希必须处理极长密码
系统 SHALL 能处理超长密码而不崩溃或导致性能问题。

#### Scenario: 1KB 长度的密码
- **WHEN** 密码长度为 1024 字符
- **THEN** 系统成功生成哈希（bcrypt 有 72 字节限制，应截断）

#### Scenario: 10KB 长度的密码
- **WHEN** 密码长度为 10240 字符
- **THEN** 系统不崩溃或耗尽内存

### Requirement: 密码哈希必须处理特殊字符
系统 SHALL 正确处理包含 Unicode、Emoji 和特殊字符的密码。

#### Scenario: Unicode 密码
- **WHEN** 密码包含中文、日文等多字节字符
- **THEN** 系统正确哈希和验证

#### Scenario: Emoji 密码
- **WHEN** 密码包含 Emoji 字符
- **THEN** 系统正确哈希和验证

#### Scenario: 包含 null 字节的密码
- **WHEN** 密码包含 \0 字符
- **THEN** 系统正确处理（不截断）

### Requirement: 密码验证必须拒绝格式错误的哈希
系统 SHALL 在哈希格式无效时返回 false。

#### Scenario: 非 bcrypt 哈希格式
- **WHEN** 哈希不是以 $2b$ 或 $2a$ 开头
- **THEN** 系统返回 false

#### Scenario: 空字符串哈希
- **WHEN** 哈希为空字符串
- **THEN** 系统返回 false

#### Scenario: 截断的哈希
- **WHEN** 哈希长度不足（只有部分）
- **THEN** 系统返回 false

### Requirement: Rate Limiter 必须处理空标识符
系统 SHALL 在传入空字符串时正确处理，不崩溃。

#### Scenario: 空字符串标识符
- **WHEN** 传入 "" 作为标识符
- **THEN** 系统将其视为有效标识符并进行限流

#### Scenario: 仅空白字符的标识符
- **WHEN** 传入 "   " （多个空格）
- **THEN** 系统将其视为有效标识符

### Requirement: Rate Limiter 必须防止长标识符 DoS 攻击
系统 SHALL 能处理超长标识符而不耗尽内存。

#### Scenario: 1KB 标识符
- **WHEN** 标识符长度为 1024 字符
- **THEN** 系统正常处理，不泄漏内存

#### Scenario: 10KB 标识符
- **WHEN** 标识符长度为 10240 字符
- **THEN** 系统正常处理或拒绝（取决于实现）

### Requirement: Rate Limiter 必须正确处理并发请求
系统 SHALL 在多个并发请求到达时正确计数，避免竞态条件。

#### Scenario: 并发请求计数准确
- **WHEN** 同时发起 5 个请求
- **THEN** 系统正确计数为 5，不遗漏或重复计数

#### Scenario: 并发超过限制
- **WHEN** 快速连续发起 6 个请求
- **THEN** 第 6 个请求被正确拒绝

### Requirement: Rate Limiter 必须处理系统时间回滚
系统 SHALL 在检测到时间回滚时重置窗口或使用单调时钟。

#### Scenario: 时间回滚检测
- **WHEN** Date.now() 返回比上次调用更早的时间
- **THEN** 系统重置该标识符的限流窗口

#### Scenario: 系统时间调整
- **WHEN** 系统时间被手动调回 1 小时
- **THEN** 系统正确处理，不冻结限流

### Requirement: Rate Limiter 重置必须处理不存在的标识符
系统 SHALL 在重置不存在的标识符时不抛出异常。

#### Scenario: 重置不存在的标识符
- **WHEN** 调用 resetRateLimit('non-existent-id')
- **THEN** 系统静默成功，不抛出异常

### Requirement: IP 提取必须处理 IPv6 缩写形式
系统 SHALL 正确解析 IPv6 的各种缩写格式。

#### Scenario: 全零缩写 ::1
- **WHEN** header 包含 "::1"
- **THEN** 系统识别为有效的 IPv6 地址

#### Scenario: 部分缩写 2001:db8::1
- **WHEN** header 包含 "2001:db8::1"
- **THEN** 系统识别为有效的 IPv6 地址

#### Scenario: 完整形式
- **WHEN** header 包含 "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
- **THEN** 系统识别为有效的 IPv6 地址

### Requirement: IP 提取必须处理 IPv4 映射的 IPv6
系统 SHALL 正确识别和处理 IPv4 映射的 IPv6 地址格式。

#### Scenario: IPv4 映射地址 ::ffff:192.0.2.1
- **WHEN** header 包含 "::ffff:192.0.2.1"
- **THEN** 系统识别为有效的 IPv6 地址

### Requirement: IP 提取必须忽略端口号
系统 SHALL 在 IP 地址包含端口号时仍能正确提取。

#### Scenario: IPv4 带端口 192.0.2.1:8080
- **WHEN** header 包含 "192.0.2.1:8080"
- **THEN** 系统提取 "192.0.2.1"（不含端口）

#### Scenario: IPv6 带端口 [2001:db8::1]:8080
- **WHEN** header 包含 "[2001:db8::1]:8080"
- **THEN** 系统正确提取 IPv6 地址

### Requirement: IP 提取必须清理 X-Forwarded-For 中的空白字符
系统 SHALL 在解析 X-Forwarded-For 时去除空格和换行。

#### Scenario: IP 间有空格
- **WHEN** X-Forwarded-For 为 "192.0.2.1, 198.51.100.1"
- **THEN** 系统正确解析两个 IP

#### Scenario: IP 间有换行
- **WHEN** X-Forwarded-For 包含换行符
- **THEN** 系统清理空白后正确解析

### Requirement: IP 提取必须拒绝所有 header 都无效的情况
系统 SHALL 在所有可能的 IP header 都无效时返回 "unknown"。

#### Scenario: 所有 header 都无效
- **WHEN** 所有 IP 相关 header 为 null、空字符串或格式错误
- **THEN** 系统返回 "unknown"

#### Scenario: header 包含 "unknown" 字符串
- **WHEN** header 的值为字符串 "unknown"
- **THEN** 系统继续检查下一个 header

### Requirement: IP 提取必须防止 header 注入
系统 SHALL 在检测到 CR/LF 字符时拒绝该 header 值。

#### Scenario: 检测 CR 字符
- **WHEN** header 包含 "\r" 字符
- **THEN** 系统拒绝该值并检查下一个 header

#### Scenario: 检测换行字符
- **WHEN** header 包含 "\n" 字符
- **THEN** 系统拒绝该值并检查下一个 header

### Requirement: IP 提取必须验证 IPv4 八位组范围
系统 SHALL 确保 IPv4 地址的每个八位组在 0-255 范围内。

#### Scenario: 八位组超过 255
- **WHEN** header 包含 "999.999.999.999"
- **THEN** 系统拒绝该值

#### Scenario: 八位组为负数
- **WHEN** header 包含 "-1.0.0.1"
- **THEN** 系统拒绝该值（或尝试解析为其他格式）

### Requirement: JWT_SECRET 必须在设置前验证
系统 SHALL 在尝试使用 JWT_SECRET 前检查其存在性和有效性。

#### Scenario: JWT_SECRET 未设置时签名失败
- **WHEN** process.env.JWT_SECRET 为 undefined 或空字符串
- **THEN** 系统抛出 "JWT_SECRET environment variable is not set" 错误

#### Scenario: JWT_SECRET 为空字符串时验证失败
- **WHEN** process.env.JWT_SECRET 为 ""
- **THEN** 系统抛出错误

### Requirement: 环境变量验证必须在模块加载时执行
系统 SHALL 在启动时验证所有必需的环境变量。

#### Scenario: 缺少 JWT_SECRET
- **WHEN** 系统启动时 JWT_SECRET 未设置
- **THEN** 首次调用相关函数时抛出描述性错误

#### Scenario: 缺少 CRON_SECRET
- **WHEN** 系统启动时 CRON_SECRET 未设置
- **THEN** 系统在需要时抛出错误或使用默认行为
