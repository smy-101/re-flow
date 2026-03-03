## Context

当前项目使用 Vitest + React Testing Library 进行单元测试，但测试质量存在严重问题：

- **测试覆盖率不足**：核心模块 `lib/rss/fetcher.ts`（RSS解析、去重、存储）、`lib/auth/env.ts`、`workers/rss-worker.ts` 完全没有测试
- **26个测试失败**：主要是 React 组件测试缺少 `act()` 包装，mock 数据不稳定
- **边缘情况覆盖缺失**：现有测试只覆盖正常路径，错误处理、边界值、并发场景、安全注入等边缘情况完全未覆盖
- **测试基础设施薄弱**：缺乏统一的 mock 工厂、测试工具函数，导致测试代码重复且难以维护

项目使用 TypeScript 5 严格模式，CI 强制零类型错误，这为编写类型安全的测试提供了良好基础。

## Goals / Non-Goals

**Goals:**
- 创建完整的测试套件，覆盖所有核心业务逻辑模块（特别是 RSS Fetcher）
- 修复所有失败的测试，确保 CI 通过
- 为现有测试添加边缘情况覆盖（边界值、错误路径、并发场景、安全测试）
- 建立统一的测试基础设施（mock 工厂、测试工具函数、测试辅助设施）
- 提升测试可维护性和可读性，使测试成为重构的安全网

**Non-Goals:**
- 不重写业务代码本身（除非发现 bug）
- 不引入端到端测试框架（如 Playwright/Cypress），专注于单元测试
- 不改变测试运行器（继续使用 Vitest）
- 不追求 100% 代码覆盖率（目标：核心业务逻辑 >80%，整体 >70%）

## Decisions

### 1. 测试框架和工具

**选择：** 继续使用 Vitest + React Testing Library

**理由：**
- 项目已配置且团队熟悉
- Vitest 与 Vite 生态深度集成，性能优秀
- React Testing Library 是 React 官方推荐的测试工具
- 无需学习新工具，降低迁移成本

**替代方案未采纳：**
- Jest：迁移成本高，Vitest 已满足需求
- AVA/Rapa: 学习曲线陡峭，社区较小

### 2. Mock 策略

**选择：** 手工 mock + Vitest native mock 相结合

**理由：**
- **手工 mock**（`__mocks__/` 目录）：适用于外部依赖（如 `rss-parser`、`bcrypt`），确保测试稳定性
- **Vitest native mock**（`vi.fn()`、`vi.mock()`）：适用于模块内部函数，提供更好的类型安全
- 统一在 `beforeEach` 中清理 mock，避免测试间互相影响

**具体规范：**
```typescript
// 外部依赖：使用 __mocks__
// __mocks__/rss-parser.ts
export const parseURL = vi.fn();

// 内部模块：使用 vi.mock()
vi.mock('@/lib/db', () => ({
  db: { query: { feeds: { findMany: vi.fn() } } }
}));
```

### 3. 测试文件组织

**选择：** 保持当前结构（`__tests__/` 镜像源码目录）

**理由：**
- 与源码对应，易于查找
- 符合项目现有约定
- Vitest 默认支持，无需额外配置

**新增：** 创建 `__tests__/utils/` 目录存放测试工具函数

### 4. 测试命名和分组

**选择：** 采用 AAA 模式（Arrange-Act-Assert）+ BDD 风格描述

**理由：**
- AAA 模式清晰分离准备、执行、断言
- BDD 风格（`describe` + `it`）使测试读起来像文档

**示例：**
```typescript
describe('Rate Limiter', () => {
  describe('checkRateLimit', () => {
    it('should allow requests within the limit', () => {
      // Arrange
      const identifier = 'test-ip';

      // Act
      const result = checkRateLimit(identifier);

      // Assert
      expect(result.allowed).toBe(true);
    });
  });
});
```

### 5. 边缘情况测试策略

**选择：** 基于风险优先级的分层测试

**分层策略：**

| 优先级 | 测试类型 | 覆盖范围 | 示例 |
|--------|----------|----------|------|
| P0 | 核心业务逻辑 | RSS 解析、认证、数据库交互 | 无效 XML、过期 JWT、数据库事务失败 |
| P1 | 输入验证 | 所有公共 API 边界 | 空字符串、超长输入、特殊字符、SQL/XSS 注入 |
| P2 | 并发和竞态 | 状态修改操作 | 并发创建相同 feed、Rate Limit 竞态 |
| P3 | 边界值 | 数值和长度边界 | userId = 0, MAX_SAFE_INTEGER, 空数组 |

**属性测试（Property Testing）：**
- 选择性引入 `fast-check` 用于数据转换函数（如 `calculateReadingTime`）
- 生成大量随机输入验证不变量（invariants）

### 6. React 组件测试修复

**选择：** 统一使用 `act()` 和 `waitFor()`

**问题根源：** 异步状态更新未包装在 `act()` 中

**解决方案：**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

// ❌ 错误：直接调用异步函数
const { rerender } = render(<Component />);
fetchData(); // 触发状态更新

// ✅ 正确：使用 act
await act(async () => {
  render(<Component />);
  await fetchData();
});

// ✅ 或使用 waitFor
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 7. 测试数据管理

**选择：** 创建统一的测试数据工厂（Factory Pattern）

**理由：**
- 避免测试间硬编码重复
- 便于生成边界值数据
- 提高测试可读性

**实现：**
```typescript
// __tests__/utils/factory.ts
export const createMockFeed = (overrides?: Partial<Feed>) => ({
  id: 1,
  userId: 1,
  title: 'Test Feed',
  feedUrl: 'https://example.com/feed.xml',
  ...overrides,
});
```

## Risks / Trade-offs

### Risk 1: 测试运行时间增加
**影响：** 边缘情况测试可能使测试运行时间翻倍（当前 25s → 预计 50-60s）

**缓解措施：**
- 使用 `vi.concurrent()` 并行运行独立测试
- 将慢速测试（如网络超时模拟）标记为 `test.slow()`
- CI 中可选择性运行完整测试套件

### Risk 2: Mock 复杂度增加
**影响：** 过度 mock 可能测试 mock 本身而非业务逻辑

**缓解措施：**
- 遵循"只 mock 直接依赖"原则
- 优先使用真实实现（如内存数据库）
- 定期审查 mock，确保与真实实现同步

### Risk 3: 测试维护负担
**影响：** 更严格的测试意味着重构时需要同步更新测试

**缓解措施：**
- 测试关注行为而非实现细节
- 使用描述性测试名称，快速定位失败原因
- 定期重构测试代码本身（Don't Repeat Yourself）

### Trade-off: 覆盖率 vs 开发速度
**选择：** 牺牲短期开发速度，换取长期维护性

**理由：**
- 测试是重构的安全网
- 缺陷越晚发现，修复成本越高
- 良好测试实际上是加速开发（减少调试时间）

## Migration Plan

### 阶段 1：修复失败测试（Week 1）
1. 修复 React 组件的 `act()` 问题
2. 稳定化 mock 数据
3. 确保 CI 全部通过

### 阶段 2：创建缺失测试（Week 2）
1. `lib/rss/fetcher.test.ts`（最高优先级）
2. `lib/auth/env.test.ts`
3. `workers/rss-worker.test.ts`

### 阶段 3：增强边缘情况（Week 3）
1. JWT、Password、Rate Limit 边缘情况
2. API 路由安全测试
3. 输入验证和边界值测试

### 阶段 4：基础设施优化（Week 4）
1. 创建测试工具函数库
2. 建立测试数据工厂
3. 编写测试最佳实践文档

### Rollback 策略
- 每个阶段独立分支，完成后合并
- 如测试失败率不降反升，回滚到上一个稳定版本
- 使用 Git bisect 快速定位引入问题的提交

## Open Questions

1. **是否需要引入测试覆盖率门禁？**
   - 选项 A：设置最低覆盖率要求（如 70%），低于则 CI 失败
   - 选项 B：仅监控覆盖率趋势，不设硬性门槛
   - **建议：** 先执行选项 B，建立基线后再考虑选项 A

2. **是否需要集成测试（Integration Tests）？**
   - 当前计划：专注于单元测试
   - 未来考虑：使用真实数据库（SQLite 内存模式）测试端到端流程
   - **建议：** 本次不包含，后续根据需要评估

3. **属性测试（Property Testing）的应用范围？**
   - 当前计划：仅用于纯函数（如 `calculateReadingTime`）
   - 未来考虑：扩展到状态转换逻辑
   - **建议：** 本次仅限纯函数，评估收益后决定是否扩展

4. **测试性能预算？**
   - 当前测试运行时间：~25s
   - 可接受范围：~60s（并行运行后）
   - **建议：** 超过 60s 时优先优化慢速测试
