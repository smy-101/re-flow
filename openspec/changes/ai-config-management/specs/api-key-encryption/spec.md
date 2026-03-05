## ADDED Requirements

### Requirement: API Key 加密存储

系统 SHALL 使用 AES-256-GCM 算法加密存储用户的 API Key。

#### Scenario: 加密 API Key
- **WHEN** 用户创建或更新 AI 配置
- **AND** 提交了 API Key
- **THEN** 系统使用 AES-256-GCM 加密 API Key
- **AND** 存储加密后的密文、IV 和认证标签

#### Scenario: 加密参数
- **WHEN** 系统加密 API Key
- **THEN** 使用 256 位（32 字节）密钥
- **AND** 使用 16 字节随机 IV
- **AND** 生成 16 字节认证标签

---

### Requirement: API Key 解密

系统 SHALL 能够解密已加密的 API Key 用于 AI 调用。

#### Scenario: 解密 API Key
- **WHEN** 系统需要使用 AI 配置调用 AI 服务
- **THEN** 系统使用存储的 IV 和认证标签解密 API Key
- **AND** 解密后的 API Key 仅在内存中使用，不输出到日志或响应

#### Scenario: 解密失败
- **WHEN** API Key 解密失败（密钥错误或数据损坏）
- **THEN** 系统返回错误"API Key 解密失败"
- **AND** 不泄露加密相关的技术细节

---

### Requirement: 加密密钥管理

系统 SHALL 通过环境变量管理加密密钥。

#### Scenario: 读取加密密钥
- **WHEN** 应用启动或需要加解密时
- **THEN** 系统从 `ENCRYPTION_KEY` 环境变量读取密钥

#### Scenario: 加密密钥缺失
- **WHEN** `ENCRYPTION_KEY` 环境变量未设置
- **THEN** 系统在启动时报错
- **AND** 拒绝处理涉及 API Key 的请求

#### Scenario: 加密密钥格式
- **WHEN** `ENCRYPTION_KEY` 不是有效的 64 字符十六进制字符串
- **THEN** 系统在启动时报错"ENCRYPTION_KEY 格式无效"

---

### Requirement: API Key 脱敏显示

系统 SHALL 在前端脱敏显示 API Key。

#### Scenario: 列表和详情中的 API Key
- **WHEN** API 返回配置数据给前端
- **THEN** API Key 字段仅显示掩码格式（如 `sk-xxxx...xxxx`）
- **AND** 掩码显示前 6 个字符和后 4 个字符

#### Scenario: 不返回完整 API Key
- **WHEN** 任何 API 响应包含配置数据
- **THEN** 完整的 API Key 不出现在响应中
