## ADDED Requirements

### Requirement: 安全的 IP 地址获取

系统 SHALL 使用优先级策略获取客户端真实 IP 地址，优先使用由受信任的代理设置的 HTTP 头。

#### Scenario: 从 Cloudflare 获取 IP
- **WHEN** 请求包含 `CF-Connecting-IP` 头
- **THEN** 系统使用此头的值作为客户端 IP
- **AND** 不检查其他头

#### Scenario: 从 X-Client-IP 获取 IP
- **WHEN** 请求不包含 `CF-Connecting-IP` 头
- **AND** 请求包含 `X-Client-IP` 头
- **THEN** 系统使用此头的值作为客户端 IP

#### Scenario: 从 X-Forwarded-For 获取最近 IP
- **WHEN** 请求不包含 `CF-Connecting-IP` 或 `X-Client-IP` 头
- **AND** 请求包含 `X-Forwarded-For` 头
- **THEN** 系统使用逗号分隔列表中的最后一个 IP
- **AND** 跳过空的或无效的 IP 地址

#### Scenario: 从 X-Real-IP 获取 IP
- **WHEN** 请求不包含上述头
- **AND** 请求包含 `X-Real-IP` 头
- **THEN** 系统使用此头的值作为客户端 IP

#### Scenario: 降级到 unknown
- **WHEN** 请求不包含任何已知的 IP 相关头
- **THEN** 系统返回 "unknown" 字符串
- **AND** 速率限制标识符基于其他可用的请求特征

### Requirement: IP 地址格式验证

系统 SHALL 验证获取的 IP 地址格式，确保为有效的 IPv4 或 IPv6 地址。

#### Scenario: 无效 IP 地址
- **WHEN** HTTP 头中的 IP 地址格式无效
- **THEN** 系统跳过该 IP
- **AND** 继续检查下一个可用的 IP 头
