## Why

当前应用缺乏统一的认证保护机制，所有页面都可以直接访问。这导致未登录用户也能访问需要认证的页面，存在安全隐患。需要建立全局的 JWT 认证检查机制，确保只有持有有效令牌的用户才能访问受保护资源。

## What Changes

- 在 Next.js App Router 中间件层添加 JWT 验证逻辑
- 定义公开路由白名单（登录页、注册页、API 登录/注册端点）
- 未认证用户访问受保护路由时重定向到登录页
- JWT 从 HTTP Cookie 中读取（与现有登录接口返回的 `token` Cookie 对应）

## Capabilities

### New Capabilities
- `jwt-auth-middleware`: 全局 JWT 认证中间件，保护除公开路由外的所有页面和 API 路由

### Modified Capabilities
- 无（现有规格的 REQUIREMENTS 无变更）

## Impact

**影响范围**：
- 新增 `middleware.ts`（Next.js 中间件，项目根目录）
- 可能需要调整现有 `app/api/auth/login/route.ts` 的 Cookie 设置逻辑（确保 HttpOnly、Secure、SameSite）
- 所有非公开页面（`app/` 下的非登录/注册页面）将自动受保护

**外部依赖**：无新增依赖（使用 Node.js 内置 `jsonwebtoken` 或类似库解析 JWT）
