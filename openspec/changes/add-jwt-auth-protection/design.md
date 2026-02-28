## Context

当前应用使用 Next.js 16 App Router，登录注册功能已实现（`app/api/auth/login/route.ts` 返回 JWT token）。但缺少全局认证保护机制，用户可以直接访问任何页面。需要在中间件层添加统一的 JWT 验证。

现有登录接口将 JWT 存储在名为 `token` 的 Cookie 中。中间件需要读取此 Cookie 并验证其有效性。

## Goals / Non-Goals

**Goals:**
- 在 Next.js 中间件层验证 JWT token
- 保护除登录/注册外的所有页面和 API 路由
- 未认证用户自动重定向到 `/login` 页面
- 支持公开路由白名单扩展

**Non-Goals:**
- 不涉及 JWT 签发逻辑（已在登录接口实现）
- 不实现角色/权限校验（仅认证验证）
- 不处理 token 刷新（使用现有 token 机制）

## Decisions

### 1. 使用 Next.js Middleware 实现 JWT 验证

**选择**: 在项目根目录创建 `middleware.ts`

**理由**:
- Next.js Middleware 在 Edge Runtime 运行，性能高
- 可拦截所有请求（页面和 API 路由）
- 避免在每个页面组件重复认证逻辑

**替代方案**: 在每个 Server Component 中验证
**拒绝原因**: 代码重复，容易遗漏，维护成本高

### 2. 使用 `jose` 库解析 JWT

**选择**: 使用 `jose` (npm 包) 验证 JWT

**理由**:
- 官方推荐的 Node.js JWT 库，支持 Edge Runtime
- 与现有登录接口（可能使用 `jsonwebtoken`）兼容
- 不依赖 Node.js 特定 API，可在 Edge 运行

**替代方案**: 使用 `jsonwebtoken`
**拒绝原因**: 不支持 Edge Runtime，中间件会报错

### 3. 公开路由配置方式

**选择**: 在 middleware 中硬编码白名单数组

**理由**:
- 当前公开路由仅 2-3 个（登录、注册、静态资源）
- 简单直接，无需额外配置文件

**未来扩展**: 如果公开路由增多，可迁移到 `middleware.config.ts`

### 4. Cookie 读取方式

**选择**: 使用 `NextRequest` 的 `cookies.get()` 方法

**理由**:
- Next.js 原生 API，无需额外解析
- 自动处理 URL 编码和 Cookie 属性

### 5. 失败处理策略

**选择**: JWT 验证失败时返回 302 重定向到 `/login`

**理由**:
- 标准的认证失败处理方式
- 保留原始请求 URL（用于登录后跳转）

**未来增强**: 可在 URL 参数中传递 `callbackUrl`

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Middleware 在 Edge Runtime 运行，部分 Node.js API 不可用 | 使用 `jose` 而非 `jsonwebtoken`，避免依赖 Node.js 特性 |
| JWT secret 在多个地方维护（登录接口 + 中间件） | 将 secret 提取到共享环境变量 `JWT_SECRET` |
| 白名单维护可能遗漏新路由 | 在新添加公开路由时更新白名单，添加代码注释提醒 |
| 中间件错误可能导致全站不可访问 | 添加 try-catch，验证失败时放行（开发环境）或重定向（生产环境） |

## Migration Plan

1. 安装 `jose` 依赖：`pnpm add jose`
2. 创建 `middleware.ts` 实现验证逻辑
3. 配置环境变量（确保 `JWT_SECRET` 与登录接口一致）
4. 测试：
   - 未登录访问受保护页面 → 重定向到登录
   - 已登录（有效 token）访问受保护页面 → 正常访问
   - 登录/注册页面 → 无需认证即可访问

## Open Questions

1. **JWT secret 存储位置**: 需确认当前登录接口使用的 secret 来源（环境变量名）
2. **登录后重定向**: 是否需要保留原始请求 URL 用于登录后跳转（可选增强）
3. **API 路由保护**: 是否需要为 API 路由返回 401 而非重定向（当前设计统一重定向）
