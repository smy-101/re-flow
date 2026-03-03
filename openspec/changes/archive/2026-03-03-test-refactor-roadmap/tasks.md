# 测试重构路线实施任务

## 1. 修复失败的测试

- [x] 1.1 修复 `AddFeedForm.test.tsx` 的 8 个失败测试，正确包装异步操作在 `act()` 中
- [x] 1.2 修复 `ItemsPage` 测试中的 `act()` 警告，使用 `waitFor()` 处理异步状态更新
- [x] 1.3 修复 `FeedsPage` 测试中的 `act()` 警告
- [x] 1.4 稳定化所有测试的 mock 数据，确保 mock 在 `beforeEach` 中正确清理
- [x] 1.5 运行 `pnpm test` 确认所有现有测试通过，无失败或警告

## 2. 创建测试基础设施

- [x] 2.1 创建 `__tests__/utils/` 目录结构
- [x] 2.2 实现 `createMockFeed()` 工厂函数，支持 overrides 参数
- [x] 2.3 实现 `createMockItem()` 工厂函数，支持内容自定义
- [x] 2.4 实现 `createMockUser()` 工厂函数
- [x] 2.5 实现 `createMockRequest()` 函数，支持 method、headers、body 设置
- [x] 2.6 实现 `createMockCookieStore()` 函数，模拟 Next.js cookies API
- [x] 2.7 实现 `createAuthenticatedRequest()` 函数，自动设置 JWT
- [x] 2.8 实现 `mockJWT()` 辅助函数，控制认证状态
- [x] 2.9 实现 `mockDate()` 函数，控制时间相关测试
- [x] 2.10 实现 `mockFetchSuccess()` 和 `mockFetchError()` 函数
- [x] 2.11 为所有测试工具函数添加 JSDoc 注释和使用示例
- [x] 2.12 创建测试工具函数的单元测试，验证其正确性 (53个测试全部通过)

## 3. 创建 RSS Fetcher 测试套件

- [x] 3.1 创建 `__tests__/lib/rss/fetcher.test.ts` 文件
- [x] 3.2 实现 `parseRSS()` 标准格式测试（RSS 2.0、Atom）
- [x] 3.3 实现 `parseRSS()` 缺失字段测试（title、pubDate、author、content）
- [x] 3.4 实现 `parseRSS()` 过滤无 link items 测试
- [x] 3.5 实现 `parseRSS()` 内容字段优先级测试（content:encoded > content > description）
- [x] 3.6 实现 `parseRSS()` 时间戳转换为 Unix 格式测试
- [x] 3.7 实现 `parseRSS()` 超时处理测试（>10s）
- [x] 3.8 实现 `parseRSS()` 无效 XML 处理测试
- [x] 3.9 实现 `dedupeItems()` 基本去重测试
- [x] 3.10 实现 `dedupeItems()` 空数组和全部重复测试
- [x] 3.11 实现 `calculateReadingTime()` 纯文本计算测试
- [x] 3.12 实现 `calculateReadingTime()` HTML 移除测试
- [x] 3.13 实现 `calculateReadingTime()` 空白字符规范化测试
- [x] 3.14 实现 `calculateReadingTime()` 最小值 1 分钟测试
- [x] 3.15 使用 fast-check 实现 `calculateReadingTime()` 属性测试
- [x] 3.16 实现 `storeItems()` 成功存储测试
- [x] 3.17 实现 `storeItems()` feed 不存在错误测试
- [x] 3.18 实现 `storeItems()` 作者 undefined 转 null 测试
- [x] 3.19 实现 `fetchAndStoreItems()` 成功流程测试
- [x] 3.20 实现 `fetchAndStoreItems()` 空 feed 测试
- [x] 3.21 实现 `fetchAndStoreItems()` 解析失败错误处理测试
- [x] 3.22 实现 `fetchAndStoreItems()` lastUpdatedAt 更新测试
- [x] 3.23 运行 RSS fetcher 测试套件，确认覆盖所有场景

## 4. 增强 JWT 测试边缘情况

- [x] 4.1 在 `__tests__/lib/auth/jwt.test.ts` 中添加过期令牌测试
- [x] 4.2 添加签名不匹配的令牌测试
- [x] 4.3 添加空字符串和格式错误令牌测试
- [x] 4.4 添加缺少 sub/exp/iat 字段的令牌测试
- [x] 4.5 添加极端 userId 测试（0、负数、MAX_SAFE_INTEGER）
- [x] 4.6 添加 JWT_SECRET 未设置时的错误测试
- [x] 4.7 运行 JWT 测试，确认所有边缘情况覆盖

## 5. 增强 Password 测试边缘情况

- [x] 5.1 在 `__tests__/lib/auth/password.test.ts` 中添加空密码哈希测试
- [x] 5.2 添加 undefined 密码错误处理测试
- [x] 5.3 添加极长密码测试（1KB、10KB）
- [x] 5.4 添加 Unicode 和 Emoji 密码测试
- [x] 5.5 添加 null 字节密码测试
- [x] 5.6 添加格式错误哈希验证测试（非 bcrypt、空字符串、截断）
- [x] 5.7 运行 Password 测试，确认所有边缘情况覆盖

## 6. 增强 Rate Limit 测试边缘情况

- [x] 6.1 在 `__tests__/lib/auth/rate-limit.test.ts` 中添加空字符串标识符测试
- [x] 6.2 添加极长标识符 DoS 测试（1KB、10KB）
- [x] 6.3 添加并发请求测试，验证计数准确性
- [x] 6.4 添加系统时间回滚测试
- [x] 6.5 添加重置不存在标识符测试
- [x] 6.6 运行 Rate Limit 测试，确认所有边缘情况覆盖

## 7. 增强 IP 提取测试边缘情况

- [x] 7.1 在 `__tests__/lib/auth/ip.test.ts` 中添加 IPv6 缩写形式测试（::1、2001:db8::1）
- [x] 7.2 添加 IPv4 映射的 IPv6 测试（::ffff:192.0.2.1）
- [x] 7.3 添加 IP 带端口号测试（192.0.2.1:8080）
- [x] 7.4 添加 X-Forwarded-For 空白字符清理测试
- [x] 7.5 添加所有 header 无效时的测试
- [x] 7.6 添加 header 注入防护测试（CR/LF 字符）
- [x] 7.7 添加 IPv4 八位组范围验证测试（>255、负数）
- [x] 7.8 运行 IP 测试，确认所有边缘情况覆盖

## 8. 创建 API 路由安全测试

- [x] 8.1 创建 `__tests__/app/api/feeds/route.security.test.ts`
- [x] 8.2 添加过期 JWT 令牌测试
- [x] 8.3 添加缺失 Cookie 测试
- [x] 8.4 添加多个 Cookie 冲突测试
- [x] 8.5 添加无效 JSON 请求体测试
- [x] 8.6 添加 SQL 注入防护测试
- [x] 8.7 添加 XSS 防护测试
- [x] 8.8 添加超长字符串拒绝测试
- [x] 8.9 添加 URL 格式验证测试
- [x] 8.10 添加并发创建相同 feed 测试
- [x] 8.11 添加跨用户访问防护测试（GET/PUT/DELETE）
- [x] 8.12 添加数据库错误处理测试
- [x] 8.13 添加 CRON_SECRET 验证测试
- [x] 8.14 运行 API 路由安全测试，确认所有场景覆盖

## 9. 创建错误路径测试

- [x] 9.1 创建 `__tests__/lib/error-handling.test.ts`
- [x] 9.2 添加网络错误捕获测试（超时、DNS 失败）
- [x] 9.3 添加数据库连接错误测试
- [x] 9.4 添加数据库事务回滚测试
- [x] 9.5 添加内存不足错误测试
- [x] 9.6 添加并发修改冲突测试
- [x] 9.7 添加 JSON 解析错误测试
- [x] 9.8 添加资源不存在 404 测试
- [x] 9.9 添加权限错误 403 测试
- [x] 9.10 添加 Rate Limit 429 测试
- [x] 9.11 添加重试机制测试（404 不重试、429 有限重试、500 指数退避）
- [x] 9.12 添加资源清理测试（连接、句柄、定时器）
- [x] 9.13 添加部分成功操作测试（批量刷新/删除）
- [x] 9.14 运行错误路径测试，确认覆盖所有场景

## 10. 创建环境变量验证测试

- [x] 10.1 创建 `__tests__/lib/auth/env.test.ts`
- [x] 10.2 添加 JWT_SECRET 缺失时的错误测试
- [x] 10.3 添加 JWT_SECRET 为空字符串时的错误测试
- [x] 10.4 添加 CRON_SECRET 验证测试
- [x] 10.5 运行环境变量测试，确认覆盖所有场景

## 11. 创建 RSS Worker 测试

- [x] 11.1 创建 `__tests__/workers/rss-worker.test.ts`
- [x] 11.2 添加定时任务调度测试（30 分钟间隔）
- [x] 11.3 添加最小刷新间隔测试（5 分钟）
- [x] 11.4 添加批量刷新流程测试
- [x] 11.5 添加错误处理和重试测试
- [x] 11.6 添加 CRON_SECRET 验证测试
- [x] 11.7 运行 RSS worker 测试，确认覆盖所有场景

## 12. 测试优化和文档

- [x] 12.1 分析测试覆盖率，识别低于 70% 的模块
- [x] 12.2 为低覆盖率模块添加补充测试
- [x] 12.3 使用 `vi.concurrent()` 标记可并行运行的测试
- [x] 12.4 将慢速测试（>1s）标记为 `test.slow()`
- [x] 12.5 创建 `__tests__/README.md`，说明测试策略和最佳实践
- [x] 12.6 在项目 README 中添加测试运行说明
- [x] 12.7 运行完整测试套件，确保所有测试通过

## 13. 代码质量检查

- [x] 13.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 13.2 运行 `pnpm test` 并确认全部通过（无失败/无报错）
- [x] 13.3 运行 `pnpm exec tsc --noEmit` 确认零类型错误
- [x] 13.4 检查测试运行时间，确保在可接受范围内（<60s）
- [x] 13.5 生成测试覆盖率报告，确认核心模块 >80%
- [x] 13.6 更新 CI 配置（如需要），确保测试在 CI 中稳定运行
