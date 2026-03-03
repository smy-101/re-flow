# 测试文档

## 概述

本项目使用 Vitest + React Testing Library 进行单元测试。测试套件覆盖了核心业务逻辑、API 路由、认证系统、RSS 解析器等模块。

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test __tests__/lib/auth/jwt.test.ts

# 监视模式（开发时使用）
pnpm test --watch

# 覆盖率报告
pnpm test --coverage

# 类型检查
pnpm exec tsc --noEmit

# Lint
pnpm lint
```

## 测试目录结构

```
__tests__/
├── setup.tsx                 # Vitest 全局设置文件
├── utils/                    # 测试工具函数
│   ├── factory.ts           # Mock 数据工厂
│   └── index.ts            # 工具函数导出
├── app/                     # Next.js App Router 测试
│   ├── (dashboard)/         # 仪表盘页面测试
│   └── api/                # API 路由测试
│       ├── feeds/          # Feeds API 测试
│       │   ├── route.test.ts
│       │   └── route.security.test.ts
│       └── items/          # Items API 测试
├── lib/                     # 核心库测试
│   ├── api/                # API 客户端测试
│   ├── auth/               # 认证模块测试
│   │   ├── jwt.test.ts
│   │   ├── password.test.ts
│   │   ├── rate-limit.test.ts
│   │   ├── ip.test.ts
│   │   └── env.test.ts
│   ├── db/                 # 数据库层测试
│   ├── rss/                # RSS 解析器测试
│   │   └── fetcher.test.ts
│   └── error-handling.test.ts  # 错误处理测试
└── workers/                  # 后台 Worker 测试
    └── rss-worker.test.ts
```

## 测试最佳实践

### 1. AAA 模式（Arrange-Act-Assert）

```typescript
it('should calculate reading time correctly', () => {
  // Arrange: 准备测试数据
  const content = ' '.repeat(250);

  // Act: 执行被测试的操作
  const result = calculateReadingTime(content);

  // Assert: 验证结果
  expect(result).toBe(1);
});
```

### 2. 使用 BDD 风格的描述

```typescript
describe('User Authentication', () => {
  describe('JWT Token Management', () => {
    it('should generate valid token for user', () => {
      // 测试实现
    });

    it('should reject expired tokens', () => {
      // 测试实现
    });
  });
});
```

### 3. React 组件测试

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

it('should render feed list after loading', async () => {
  await act(async () => {
    render(<FeedsPage />);
    await fetchFeeds();
  });

  await waitFor(() => {
    expect(screen.getByText('My Feed')).toBeInTheDocument();
  });
});
```

### 4. Mock 策略

**外部依赖：** 使用 `__mocks__` 目录
```typescript
// __mocks__/rss-parser.ts
export const parseURL = vi.fn();
```

**内部模块：** 使用 `vi.mock()`
```typescript
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      feeds: {
        findMany: vi.fn(),
      },
    },
  },
}));
```

**在 `beforeEach` 中清理 mock：**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### 5. 异步操作

**使用 `act()` 包装状态更新：**
```typescript
await act(async () => {
  const result = await someAsyncOperation();
  // 更新状态
});
```

**使用 `waitFor()` 等待 UI 更新：**
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## 测试工具函数

### Mock 数据工厂

位于 `__tests__/utils/factory.ts`，提供便捷的 mock 数据生成：

```typescript
import { createMockFeed, createMockUser, createMockRequest } from '@/__tests__/utils/factory';

// 创建 mock feed（可覆盖默认值）
const feed = createMockFeed({ title: 'Custom Title' });

// 创建 mock user
const user = createMockUser({ id: 123 });

// 创建 mock request
const request = createMockRequest({ method: 'POST', body: { key: 'value' }});
```

### 认证辅助函数

```typescript
import { createAuthenticatedRequest, mockJWT } from '@/__tests__/utils/factory';

// 创建已认证的请求
const authRequest = createAuthenticatedRequest(123);

// Mock JWT 验证
mockJWT({ userId: 123 });
```

### 时间控制

```typescript
import { mockDate } from '@/__tests__/utils/factory';

// Mock 当前时间
mockDate(new Date('2024-01-01T00:00:00Z'));
```

## 测试分类

### P0 - 核心业务逻辑
- RSS 解析和存储
- JWT 认证流程
- 数据库事务
- **要求：** 100% 覆盖率

### P1 - 输入验证
- API 请求参数验证
- URL 格式验证
- SQL/XSS 注入防护
- **要求：** >90% 覆盖率

### P2 - 并发和竞态
- Rate Limit 竞态
- 并发创建相同 feed
- 数据库并发修改
- **要求：** >80% 覆盖率

### P3 - 边界值
- 极端输入（空字符串、超长字符串）
- 边界数值（0、MAX_SAFE_INTEGER）
- Unicode 和特殊字符
- **要求：** >70% 覆盖率

## 属性测试（Property Testing）

使用 `fast-check` 进行属性测试：

```typescript
import * as fc from 'fast-check';

it('should always return at least 1 minute', () => {
  fc.assert(
    fc.property(fc.string(), (content) => {
      const result = calculateReadingTime(content);
      return result >= 1;
    })
  );
});
```

## 安全测试

### 必需的安全测试场景

1. **认证安全**
   - 过期令牌
   - 签名不匹配
   - 缺失 Cookie
   - 多 Cookie 冲突

2. **输入验证**
   - SQL 注入防护
   - XSS 防护
   - 超长字符串拒绝
   - URL 格式验证

3. **授权**
   - 跨用户访问防护
   - 资源所有权检查
   - 权限验证

4. **速率限制**
   - Rate Limit 429 响应
   - 重试机制
   - 指数退避

## 错误处理测试

### 错误场景覆盖

1. **网络错误**
   - 超时
   - DNS 失败
   - 连接中断

2. **数据库错误**
   - 连接失败
   - 事务回滚
   - 约束冲突

3. **解析错误**
   - 无效 XML
   - JSON 解析失败
   - 类型转换错误

4. **资源清理**
   - 连接关闭
   - 句柄释放
   - 定时器清理

## 并行测试

使用 `vi.concurrent()` 标记可并行的测试：

```typescript
describe.concurrent('Independent Tests', () => {
  it('should run in parallel', async () => {
    // 独立测试逻辑
  });
});
```

**注意：** 只有以下测试可以并行：
- 不共享状态
- 不使用相同的 mock
- 不依赖执行顺序

## 慢速测试

将慢速测试标记为 `test.slow()`：

```typescript
it.slow('should process large dataset', async () => {
  // 耗时超过 1 秒的测试
});
```

慢速测试在 CI 中可以被选择性运行。

## 测试覆盖率目标

| 模块 | 目标覆盖率 | 当前状态 |
|------|------------|----------|
| RSS Fetcher | >90% | ✓ |
| 认证模块 | >90% | ✓ |
| API 路由 | >85% | ✓ |
| 数据库层 | >80% | ✓ |
| Worker | >80% | ✓ |
| 整体项目 | >75% | - |

## CI/CD 集成

### GitHub Actions 配置

测试在 CI 中通过以下步骤运行：

1. 安装依赖：`pnpm install`
2. 类型检查：`pnpm exec tsc --noEmit`
3. Lint：`pnpm lint`
4. 测试：`pnpm test`

### 覆盖率门槛

- **最低覆盖率：** 70%
- **失败条件：** 低于最低覆盖率时 CI 失败

## 故障排查

### 常见问题

**1. React `act()` 警告**
```
Error: Not wrapped in act(...)
```
**解决：** 使用 `act()` 或 `waitFor()` 包装异步操作

**2. Mock 未清理**
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

**3. 测试间状态泄漏**
- 在 `afterEach` 中重置状态
- 使用隔离的测试数据

**4. 异步测试超时**
- 使用 `waitFor()` 而不是固定延迟
- 检查 mock 是否正确返回 Promise

## 参考资料

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM 匹配器](https://github.com/testing-library/jest-dom)
- [fast-check 属性测试](https://github.com/dubzzz/fast-check)
