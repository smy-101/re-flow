## Context

当前代码库存在多个安全和代码质量问题：
- **IP 地址可伪造**：登录路由使用 `X-Forwarded-For` 头获取客户端 IP，该头可由客户端任意设置，导致速率限制可被绕过
- **时序攻击风险**：CRON_SECRET 使用 `!==` 直接比较字符串
- **代码重复**：12+ 个 API 路由中存在相同的 token 验证逻辑（约 8-10 行重复代码）
- **TypeScript 类型错误**：测试文件无法识别 Vitest 全局函数（`describe`, `it`, `expect`, `vi` 等）
- **环境变量未验证**：JWT_SECRET 配置为空字符串默认值，仅在运行时抛出错误

## Goals / Non-Goals

**Goals:**
- 修复 IP 地址验证绕过漏洞，优先使用受信任的代理头
- 使用恒定时间比较防止时序攻击
- 创建统一的认证辅助函数，消除 12+ 个路由中的重复代码
- 配置 TypeScript 以支持 Vitest 全局类型，消除类型检查错误
- 在应用启动时验证必需的环境变量，快速失败
- 改进 JWT 配置，移除空字符串默认值

**Non-Goals:**
- 不改变认证逻辑的行为（仅重构代码结构）
- 不引入新的外部依赖
- 不改变速率限制的存储方式（仍使用内存 Map，适用于单实例部署）
- 不迁移到中间件架构（保持当前的手动验证模式，但提取公共逻辑）

## Decisions

### 1. IP 地址获取策略

**选择**：创建 `getClientIp` 辅助函数，按优先级获取 IP：
1. `CF-Connecting-IP`（Cloudflare）
2. `X-Client-IP`（某些代理）
3. `X-Forwarded-For` 的最后一个 IP（受信任的代理设置）
4. `X-Real-IP`（Nginx）
5. 降级为 `unknown`

**理由**：
- 优先使用由 CDN/代理设置的、不可伪造的头
- `X-Forwarded-For` 的最后一个 IP 是最近一个受信任代理添加的，比第一个更可靠
- 保持降级策略以确保兼容性

**替代方案**：
- 仅使用 `X-Forwarded-For` 的第一个 IP（风险：可被客户端伪造）
- 使用所有头的组合（过于复杂，增加失败模式）

### 2. 时序安全比较

**选择**：使用 Node.js 的 `crypto.timingSafeEqual` 替换 `!==` 字符串比较

**理由**：
- 标准库提供，无需引入新依赖
- 防止通过响应时间推断字符串差异
- 对于内部 API 修复成本低，安全性收益明显

**限制**：
- `timingSafeEqual` 要求 Buffer 长度相同，需要先检查长度
- 需要处理不同长度的字符串比较场景

### 3. 认证辅助函数

**选择**：在 `lib/auth/` 中创建 `getAuthenticatedUser` 辅助函数：
```typescript
export async function getAuthenticatedUser(request?: NextRequest): Promise<number | NextResponse>
```

**理由**：
- 返回类型联合，允许成功时返回 userId，失败时返回 NextResponse
- 保持与现有代码的错误响应格式一致
- 可选的 request 参数，支持直接从 cookies 获取（适用于大多数路由）
- 与 `cookies()` API 集成良好

**使用示例**：
```typescript
// 之前
const cookieStore = await cookies();
const token = cookieStore.get('token')?.value;
if (!token) {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}
const userId = await getUserIdFromToken(token);
if (!userId) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}

// 之后
const userId = await getAuthenticatedUser();
if (userId instanceof NextResponse) return userId;
```

**替代方案**：
- 使用 Next.js 中间件（需要重构，影响范围大）
- 使用装饰器/高阶函数（TypeScript 装饰器仍在实验阶段）

### 4. TypeScript 全局类型配置

**选择**：在 `tsconfig.json` 的 `compilerOptions.types` 中添加 `"vitest/globals"`

**理由**：
- `vitest.config.ts` 已设置 `globals: true`
- 这是 Vitest 推荐的配置方式
- 仅影响类型检查，不影响运行时行为

### 5. 环境变量验证

**选择**：在 `lib/auth/env.ts` 中创建 `validateEnv` 函数，在应用入口调用

**实现位置**：
- 创建 `lib/auth/env.ts`，定义所有必需的环境变量
- 在 `app/layout.tsx` 或单独的初始化模块中调用
- 使用 `process.exit(1)` 在验证失败时终止应用

**验证时机**：应用启动时（而非首次请求时）

**替代方案**：
- 使用 `zod` 或 `yup`（引入新依赖，当前项目未使用）
- 延迟到首次使用时验证（不符合快速失败原则）

## Risks / Trade-offs

### 风险 1：IP 获取策略可能不适用所有部署环境

**场景**：某些代理或 CDN 不设置 `CF-Connecting-IP` 或 `X-Client-IP`

**缓解措施**：提供降级策略（`X-Real-IP` → `X-Forwarded-For` → `unknown`），确保至少有一个值可用

### 风险 2：认证辅助函数的返回类型可能增加理解成本

**场景**：开发者不熟悉联合返回类型模式

**缓解措施**：
- 提供清晰的 JSDoc 注释和使用示例
- 在设计文档和代码审查中强调此模式

### 风险 3：环境变量验证在开发环境可能过于严格

**场景**：开发者启动应用时忘记设置环境变量

**缓解措施**：
- 提供清晰的错误消息，指出缺少哪些环境变量
- 在 `.env.local.example` 中包含所有必需的环境变量

### 权衡：保持内存速率限制 vs 使用 Redis

**选择**：保持内存 Map 存储（适用于单实例部署）

**原因**：
- 当前架构使用独立的 RSS worker 进程，Web 应用是单实例
- Redis 会引入新的依赖和基础设施复杂度
- 如果将来需要多实例，可以单独迁移

**未来考虑**：如果部署到多实例环境，需要迁移到共享存储（Redis）

## Migration Plan

### 部署步骤

1. **创建新的辅助函数**（不破坏现有功能）
   - 创建 `lib/auth/ip.ts`：IP 获取函数
   - 创建 `lib/auth/auth-helper.ts`：认证辅助函数
   - 创建 `lib/auth/env.ts`：环境变量验证
   - 更新 `tsconfig.json`：添加 Vitest 类型

2. **更新现有代码**
   - 更新 `app/api/auth/login/route.ts`：使用新的 IP 获取函数
   - 更新 `app/api/feeds/refresh-all/route.ts`：使用恒定时间比较
   - 更新 12+ 个 API 路由：使用 `getAuthenticatedUser` 辅助函数

3. **添加应用启动验证**
   - 在 `app/layout.tsx` 或单独初始化模块中调用 `validateEnv`

4. **测试验证**
   - 运行 `pnpm test` 确保测试通过
   - 运行 `pnpm exec tsc --noEmit` 确保类型检查通过
   - 手动测试登录和 API 调用

### 回滚策略

所有修改都是向后兼容的，可以通过 git revert 快速回滚：
- 认证逻辑行为不变
- 环境变量验证仅在启动时失败（配置错误时拒绝启动是正确行为）
- 类型配置更改不影响运行时

## Open Questions

1. **应用启动验证的位置**：应该在 `app/layout.tsx` 还是创建单独的 `lib/init.ts` 模块？

   **倾向**：创建 `lib/init.ts` 并在 `app/layout.tsx` 顶部调用，保持职责分离

2. **是否需要为认证辅助函数编写单元测试**？

   **倾向**：是的，覆盖成功和失败场景，确保重构不破坏行为

3. **环境变量错误消息的语言**：中文还是英文？

   **建议**：使用中文，与项目其他错误消息保持一致
