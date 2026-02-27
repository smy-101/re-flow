# User Authentication Design

## Context

当前应用是一个全新的 Next.js 16 项目，使用 App Router 和 React 19。项目尚未实现任何用户认证功能，需要从零开始构建完整的身份认证系统。

**约束条件：**
- 必须使用 Drizzle ORM + SQLite 作为数据持久化方案
- 遵循 Next.js 16 App Router 的 Server Actions/Route Handlers 模式
- TypeScript 严格模式，不允许 any 类型
- 遵循 React 最佳实践（Server Components 优先）

**利益相关者：**
- 最终用户：需要安全、可靠的登录/注册体验
- 开发团队：需要可维护、可扩展的认证架构

## Goals / Non-Goals

**Goals:**
- 实现安全的用户注册、登录、登出功能
- 使用 JWT（JSON Web Token）进行无状态认证
- 使用 HTTP-only Cookie 存储 JWT（防御 XSS）
- 密码使用 bcrypt 哈希存储（salt rounds: 10）
- 提供清晰的用户反馈和错误处理
- 建立可扩展的认证架构，便于未来添加 OAuth、2FA 等

**Non-Goals:**
- 不实现邮箱验证（可后续添加）
- 不实现密码重置功能（可后续添加）
- 不实现 OAuth 第三方登录（可后续添加）
- 不实现用户资料管理（可后续添加）
- 不实现 JWT 黑名单（令牌撤销需要额外存储）

## Decisions

### 1. 数据库 Schema 设计

**选择：** 使用 Drizzle ORM 定义 `users` 表

```sql
-- users 表
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

**理由：**
- SQLite 的 INTEGER PRIMARY KEY AUTOINCREMENT 提供高性能的自增 ID
- 使用 TEXT 存储 username 支持国际化字符
- 无需 sessions 表，JWT 令牌无状态存储在客户端

**替代方案：**
- 使用 UUID 作为用户 ID：增加存储开销，SQLite 性能不如自增 ID

### 2. 认证方案

**选择：** 使用 JWT（JSON Web Token）+ HTTP-only Cookie

**理由：**
- **无状态**: 服务器无需存储会话，减少数据库查询
- **可扩展**: 天然支持分布式部署，无需会话同步
- **性能**: 每次请求无需查询数据库验证会话
- **标准化**: JWT 是业界标准，库支持完善（使用 jose）
- **安全性**: HTTP-only Cookie 防止 XSS，签名防篡改

**JWT 结构：**
```
{
  "sub": "user_id",      // 用户 ID
  "iat": 1234567890,     // 签发时间
  "exp": 1235172690      // 过期时间（7 天后）
}
```

**替代方案：**
- 数据库会话：支持即时撤销，但每次请求需查询数据库
- LocalStorage 存储 JWT：易受 XSS 攻击
- 不使用 Cookie：需要前端手动处理令牌，容易出错

### 3. 密码哈希方案

**选择：** bcrypt 算法，salt rounds = 10

**理由：**
- bcrypt 是业界标准，自动处理 salt
- salt rounds = 10 平衡安全性和性能（约 100ms/次）
- 自适应哈希成本，可随硬件升级调整

**替代方案：**
- argon2：更安全但 Node.js 生态支持不如 bcrypt
- PBKDF2：NIST 标准，但计算速度较快，易受 GPU 破解

### 4. API 路由设计

**选择：** 使用 Next.js Route Handlers (`app/api/auth/*`)

```
app/api/auth/
├── register/route.ts    # POST /api/auth/register
├── login/route.ts       # POST /api/auth/login
└── logout/route.ts      # POST /api/auth/logout
```

**理由：**
- Route Handlers 符合 Next.js 16 最佳实践
- 便于与 Server Components 集成
- 支持 Edge Runtime（未来可迁移到 Edge）

### 5. 中间件认证

**选择：** 使用 `middleware.ts` 验证受保护路由

**理由：**
- 统一的认证入口点
- 在请求到达页面组件前完成验证
- 支持路由级权限控制

```typescript
// middleware.ts (简化示例)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isValidToken = await verifyJWT(token)

  if (!isValidToken && isProtectedRoute(request)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

### 6. 目录结构

```
lib/
├── db/
│   ├── index.ts           # 数据库连接导出
│   ├── schema.ts          # Drizzle schema 定义
│   └── migrations/        # 数据库迁移文件
├── auth/
│   ├── password.ts        # 密码哈希/验证工具
│   ├── jwt.ts             # JWT 签发/验证工具
│   └── rate-limit.ts      # 登录速率限制

app/
├── api/auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   └── logout/route.ts
├── login/
│   └── page.tsx           # 登录页面（Client Component）
└── register/
    └── page.tsx           # 注册页面（Client Component）
```

## Risks / Trade-offs

### Risk 1: SQLite 并发写入限制

**风险：** SQLite 在高并发写入场景下可能出现 "database is locked" 错误。

**缓解措施：**
- 使用 WAL 模式（Write-Ahead Logging）提高并发性能
- 登录/注册操作低频，影响有限
- 未来可迁移到 PostgreSQL（Drizzle 支持平滑迁移）

### Risk 2: JWT 令牌泄露

**风险：** 如果 JWT 泄露，攻击者可劫持用户会话直到令牌过期。

**缓解措施：**
- HTTP-only + Secure Cookie 防止 XSS 窃取
- SameSite=Strict 防止 CSRF 攻击
- 7 天过期时间限制泄露窗口
- 短期可添加 JWT 黑名单（使用 Redis）支持即时撤销
- 监控异常登录行为（未来添加）

### Risk 3: bcrypt 拒绝服务

**风险：** 攻击者大量发送登录请求，消耗服务器 CPU 资源。

**缓解措施：**
- 速率限制（1 分钟 5 次登录尝试）
- 用户名验证在密码哈希之前执行（快速失败）
- 考虑使用 Edge Worker 卸载哈希计算（未来优化）

### Trade-off 1: 安全性 vs 用户体验

7 天会话过期时间在安全性和便利性之间取得平衡：
- 更短（如 1 天）更安全但用户体验差
- 更长（如 30 天）更便利但增加泄露风险

### Trade-off 2: 数据库选择

选择 SQLite 而非 PostgreSQL：
- 优势：零配置、易于开发、备份简单
- 劣势：并发写入限制、缺乏高级功能
- 结论：适合早期开发，未来可平滑迁移

## Migration Plan

### 部署步骤

1. **安装依赖**
   ```bash
   pnpm add drizzle-orm better-sqlite3 bcrypt jose
   pnpm add -D drizzle-kit @types/bcrypt
   ```

2. **配置数据库**
   - 创建 `lib/db/schema.ts` 定义表结构
   - 创建 `lib/db/index.ts` 导出 db 实例
   - 配置 `drizzle.config.ts`

3. **运行迁移**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

4. **实现 API 路由**
   - 按顺序实现：register → login → logout

5. **创建 UI 页面**
   - 注册页面 `/register`
   - 登录页面 `/login`

6. **配置中间件**
   - 添加 `middleware.ts` 验证受保护路由

7. **测试**
   - 单元测试：密码哈希、JWT 签发/验证
   - 集成测试：注册/登录/登出流程
   - 安全测试：SQL 注入、XSS、CSRF

### 回滚策略

- 数据库迁移失败：回滚到上一个迁移版本
- API 变更破坏：保留旧版 API 24 小时
- 使用 Git 分支隔离变更，支持快速回滚

## Open Questions

1. **是否需要实现 JWT 刷新令牌（Refresh Token）？**
   - 当前设计：7 天固定过期，需重新登录
   - 未来可添加：Refresh Token 实现无感续期

2. **是否需要实现 JWT 黑名单？**
   - 支持场景：强制登出、封禁用户、密码修改后撤销旧令牌
   - 实现方式：使用 Redis 或数据库存储已撤销令牌 ID
   - 权衡：增加额外存储和查询，失去无状态优势

3. **是否需要实现登录日志？**
   - 安全审计需求：记录 IP、时间、设备
   - 隐私考虑：需符合 GDPR 等法规

4. **是否需要实现账户锁定？**
   - 防暴力破解：5 次失败后锁定 15 分钟
   - 用户体验：可能被滥用锁定他人账户
