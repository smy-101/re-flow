# 测试基础设施增强规范

本规范扩展测试基础设施，包括测试工具函数、mock 工厂、测试辅助设施等。

## MODIFIED Requirements

### Requirement: TypeScript Vitest 全局类型支持

系统 SHALL 配置 TypeScript 以识别 Vitest 的全局测试函数和变量。

#### Scenario: 全局函数类型识别
- **WHEN** 在测试文件中使用 `describe`, `it`, `expect`, `vi` 等全局函数
- **THEN** TypeScript 正确识别这些函数的类型
- **AND** 不抛出 "Cannot find name" 错误

#### Scenario: 测试文件编译通过
- **WHEN** 运行 `pnpm exec tsc --noEmit`
- **THEN** 测试文件不产生类型错误
- **AND** 类型检查成功通过

#### Scenario: Vitest 配置保持一致
- **WHEN** TypeScript 配置已设置全局类型支持
- **THEN** vitest.config.ts 的 `globals: true` 设置保持不变
- **AND** 测试运行器行为不受影响

## ADDED Requirements

### Requirement: 测试工具函数库必须提供常用辅助函数
系统 SHALL 在 `__tests__/utils/` 目录下提供可复用的测试工具函数。

#### Scenario: 提供 mock 数据生成器
- **WHEN** 测试需要 mock 数据
- **THEN** 系统提供 `createMockFeed()`, `createMockItem()`, `createMockUser()` 等函数
- **AND** 这些函数允许通过 `overrides` 参数自定义字段

#### Scenario: 提供请求 mock 工厂
- **WHEN** 测试需要 mock NextRequest
- **THEN** 系统提供 `createMockRequest()` 函数，支持设置 method、headers、body 等

#### Scenario: 提供 Cookie mock 工厂
- **WHEN** 测试需要 mock cookie store
- **THEN** 系统提供 `createMockCookieStore()` 函数，模拟 Next.js cookies() API

### Requirement: 测试数据工厂必须支持默认值和自定义
系统 SHALL 的数据工厂函数提供合理的默认值，同时支持完全自定义。

#### Scenario: Feed 工厂提供默认值
- **WHEN** 调用 `createMockFeed()` 不带参数
- **THEN** 返回包含 id、userId、title、feedUrl 等必要字段的对象

#### Scenario: Feed 工厂支持字段覆盖
- **WHEN** 调用 `createMockFeed({ title: 'Custom Title' })`
- **THEN** 返回对象中 title 为 'Custom Title'，其他字段使用默认值

#### Scenario: Item 工厂支持不同内容类型
- **WHEN** 调用 `createMockItem({ content: '<p>HTML</p>' })`
- **THEN** 返回对象的 content 字段为指定值

### Requirement: Mock 工厂必须类型安全
系统 SHALL 的所有工厂函数使用 TypeScript 类型，确保类型安全。

#### Scenario: Feed 工厂返回正确类型
- **WHEN** 调用 `createMockFeed()`
- **THEN** 返回值类型符合 `Feed` 接口

#### Scenario: overrides 参数类型正确
- **WHEN** 传入 `overrides` 参数
- **THEN** TypeScript 正确推断参数类型为 `Partial<Feed>`

### Requirement: 测试工具必须提供数据库 mock 辅助
系统 SHALL 提供辅助函数简化数据库操作的 mock。

#### Scenario: Mock db.query 操作
- **WHEN** 测试需要 mock `db.query.feeds.findMany()`
- **THEN** 提供辅助函数快速设置常见的查询 mock

#### Scenario: Mock db.insert 操作
- **WHEN** 测试需要 mock `db.insert().values().returning()`
- **THEN** 提供辅助函数模拟链式调用

#### Scenario: Mock db.update 操作
- **WHEN** 测试需要 mock `db.update().set().where()`
- **THEN** 提供辅助函数模拟更新操作

### Requirement: 测试工具必须提供认证辅助
系统 SHALL 提供辅助函数简化认证相关的测试设置。

#### Scenario: 创建已认证的请求 mock
- **WHEN** 测试需要模拟已认证的请求
- **THEN** 提供 `createAuthenticatedRequest()` 函数，自动设置有效的 JWT cookie

#### Scenario: Mock JWT 验证
- **WHEN** 测试需要控制 JWT 验证结果
- **THEN** 提供 `mockJWT()` 函数，可以指定返回的 userId 或返回 null（未认证）

### Requirement: 测试工具必须提供时间控制辅助
系统 SHALL 提供辅助函数控制时间相关的测试。

#### Scenario: Mock Date.now
- **WHEN** 测试需要固定时间
- **THEN** 提供 `mockDate()` 函数，设置固定的 Date.now() 返回值

#### Scenario: Mock 定时器
- **WHEN** 测试需要控制 setTimeout/setInterval
- **THEN** 提供 `useFakeTimers()` 辅助函数，使用 Vitest 的 fake timers

### Requirement: 测试工具必须提供网络请求辅助
系统 SHALL 提供辅助函数 mock fetch 请求。

#### Scenario: Mock 成功的 fetch 响应
- **WHEN** 测试需要 mock fetch 返回成功
- **THEN** 提供 `mockFetchSuccess()` 函数，设置响应数据

#### Scenario: Mock 失败的 fetch 响应
- **WHEN** 测试需要 mock fetch 返回错误
- **THEN** 提供 `mockFetchError()` 函数，设置错误状态码和消息

#### Scenario: Mock 网络超时
- **WHEN** 测试需要模拟网络超时
- **THEN** 提供 `mockFetchTimeout()` 函数，模拟超时场景

### Requirement: 测试工具必须提供 React 组件测试辅助
系统 SHALL 提供辅助函数简化 React 组件测试。

#### Scenario: 提供自定义 render 函数
- **WHEN** 测试需要包装 provider
- **THEN** 提供自定义 `render()` 函数，自动包装必要的 providers

#### Scenario: 提供 waitFor 辅助
- **WHEN** 测试需要等待异步状态
- **THEN** 提供 `waitForElement()` 等辅助函数，简化异步测试

### Requirement: 测试工具函数必须有单元测试
系统 SHALL 的所有测试工具函数本身都有测试覆盖。

#### Scenario: 工厂函数生成正确的数据
- **WHEN** 测试工厂函数
- **THEN** 验证生成的数据符合预期格式和类型

#### Scenario: Mock 辅助函数正确设置 mock
- **WHEN** 测试 mock 辅助函数
- **THEN** 验证 mock 被正确设置且可按预期工作

### Requirement: 测试工具必须有清晰的文档
系统 SHALL 为每个测试工具函数提供 JSDoc 注释和使用示例。

#### Scenario: 每个函数有 JSDoc
- **WHEN** 查看测试工具函数代码
- **THEN** 每个函数有描述参数和返回值的 JSDoc 注释

#### Scenario: 提供使用示例
- **WHEN** 查看测试工具文件
- **THEN** 关键函数有使用示例注释或单独的示例文件

### Requirement: 测试工具必须支持开发环境配置
系统 SHALL 根据环境变量调整测试行为。

#### Scenario: 开发环境显示详细错误
- **WHEN** NODE_ENV 为 development 且测试失败
- **THEN** 测试工具显示详细的错误信息和堆栈

#### Scenario: CI 环境优化输出
- **WHEN** 在 CI 环境运行测试
- **THEN** 测试工具减少冗余输出，提高可读性

### Requirement: 测试工具必须支持并行测试
系统 SHALL 的测试工具函数支持 Vitest 的并行测试模式。

#### Scenario: 工厂函数无副作用
- **WHEN** 多个测试并行调用工厂函数
- **THEN** 每个测试获得独立的 mock 数据，不互相影响

#### Scenario: Mock 隔离
- **WHEN** 测试使用 mock 辅助函数
- **THEN** Mock 在 beforeEach 中自动清理，不污染其他测试

### Requirement: 测试工具必须提供性能监控辅助
系统 SHALL 提供辅助函数检测性能回归。

#### Scenario: 测量函数执行时间
- **WHEN** 需要测试函数性能
- **THEN** 提供 `measureTime()` 辅助函数，测量执行时间

#### Scenario: 断言性能阈值
- **WHEN** 需要确保操作不超过特定时间
- **THEN** 提供 `assertPerformance()` 辅助函数，断言执行时间在阈值内

### Requirement: 测试工具必须支持快照测试
系统 SHALL 提供辅助函数简化快照测试的编写。

#### Scenario: 创建快照测试辅助
- **WHEN** 测试需要快照复杂对象
- **THEN** 提供 `toMatchSnapshot()` 的包装函数，自动格式化输出

#### Scenario: 内联快照更新
- **WHEN** 快照需要更新
- **THEN** 提供命令或函数快速更新过期的快照
