## Why

代码审查发现了多个安全和代码质量问题，需要修复以确保应用的安全性和可维护性。当前存在：
- **安全风险**：IP 地址可被伪造导致速率限制可被绕过，存在时序攻击风险
- **类型错误**：测试文件缺少 Vitest 全局类型定义，导致 TypeScript 检查失败
- **代码重复**：12+ 个 API 路由中存在相同的认证逻辑
- **配置问题**：环境变量未在启动时验证，空字符串处理不当

## What Changes

- **IP 验证增强**：使用更可靠的 IP 获取策略，优先使用受信任的代理头
- **恒定时间比较**：使用 `crypto.timingSafeEqual` 替换字符串直接比较
- **认证逻辑抽象**：创建统一的认证辅助函数，消除重复代码
- **类型系统修复**：配置 tsconfig.json 以支持 Vitest 全局类型
- **环境变量验证**：在应用启动时验证必需的环境变量
- **JWT 配置改进**：移除空字符串默认值，在启动时验证 JWT_SECRET

## Capabilities

### New Capabilities
- `auth-helper`: 认证辅助函数，统一处理 token 验证和用户 ID 提取
- `env-validation`: 应用启动时的环境变量验证机制

### Modified Capabilities
- `rate-limiting`: 增强 IP 地址获取逻辑，优先使用受信任的代理头
- `test-setup`: 配置 TypeScript 以支持 Vitest 全局类型

## Impact

- **代码范围**：12+ 个 API 路由文件、认证相关工具、测试配置文件
- **不兼容变更**：无，所有修复向后兼容
- **依赖变更**：无新增依赖
