## Why

当前项目测试存在严重缺陷：26个测试失败，核心模块（RSS Fetcher、认证边缘情况、API路由安全）完全缺失测试覆盖，现有测试未覆盖边缘情况和错误路径。这可能导致生产环境出现未捕获的bug和安全漏洞。测试质量直接影响代码重构的信心和系统的可靠性。

## What Changes

- **新增测试模块**：为 `lib/rss/fetcher.ts`、`lib/auth/env.ts`、`workers/rss-worker.ts` 创建完整测试套件
- **增强现有测试**：为 JWT、Rate Limit、Password、IP验证、API Client 添加边缘情况测试（过期令牌、并发请求、极端输入、安全注入等）
- **修复失败测试**：修复 26 个失败的测试，特别是 `AddFeedForm.test.tsx` 的 React `act()` 包装问题
- **提升测试标准**：引入边界值测试、属性测试（Property Testing）、错误恢复路径测试
- **改进测试基础设施**：统一 mock 策略，添加测试工具函数

## Capabilities

### New Capabilities
- `rss-fetcher-testing`: RSS 解析、去重、阅读时间计算和存储流程的完整测试覆盖
- `auth-edge-cases`: 认证模块（JWT、密码、Rate Limit、IP）的边缘情况和安全性测试
- `api-route-security`: API 路由的输入验证、授权检查、错误处理测试
- `error-path-coverage`: 错误恢复路径和异常场景的测试策略

### Modified Capabilities
- `test-infrastructure`: 测试工具函数、mock 工厂、测试辅助设施的标准化

## Impact

- **代码质量**：提高测试覆盖率，降低生产环境 bug 率
- **维护信心**：为重构提供安全网，确保回归测试快速发现问题
- **开发效率**：通过更好的错误报告和调试信息减少问题排查时间
- **受影响文件**：`__tests__/` 目录下所有测试文件，可能需要新增测试工具函数到 `__tests__/utils/`
- **CI/CD**：测试运行时间可能增加，但测试可信度大幅提升
