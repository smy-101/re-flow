## Why

当前应用缺乏用户身份认证能力，无法识别用户身份、保护数据或提供个性化体验。作为基础功能，用户认证是实现后续用户相关功能（如数据持久化、权限控制）的必要前提。

## What Changes

- 新增用户注册功能，支持用户名+密码创建账户
- 新增用户登录功能，验证用户名+密码并签发 JWT
- 新增用户登出功能，清除客户端 JWT Cookie
- 新增 JWT 认证，使用 HTTP-only Cookie 存储 JWT 令牌
- 集成 Drizzle ORM + SQLite 作为用户数据持久化方案
- 密码使用 bcrypt 哈希存储（salt rounds: 10）

## Capabilities

### New Capabilities

- `user-registration`: 用户注册能力，包括表单验证、密码哈希、账户创建
- `user-authentication`: 用户认证能力，包括登录验证、JWT 签发、登出
- `jwt-auth`: JWT 令牌管理能力，包括令牌签发、验证、续期

### Modified Capabilities

- None

## Impact

**新增依赖：**
- `drizzle-orm` - ORM 核心
- `drizzle-kit` - 数据库迁移 CLI
- `better-sqlite3` - SQLite 驱动
- `bcrypt` - 密码哈希
- `@types/bcrypt` - TypeScript 类型
- `jose` - JWT 签发和验证库

**新增代码：**
- `lib/db/` - 数据库连接、Schema 定义、迁移
- `lib/auth/jwt.ts` - JWT 令牌签发和验证
- `app/api/auth/` - 认证 API 路由（login/register/logout）
- `app/login/` - 登录页面
- `app/register/` - 注册页面
- `middleware.ts` - JWT 验证中间件

**数据库变更：**
- 新增 `users` 表（id, username, password_hash, created_at）
