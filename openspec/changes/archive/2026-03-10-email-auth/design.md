## 背景

当前系统使用 `username` 作为登录凭证，用户表结构为 `users(id, username, passwordHash, createdAt)`。本次改造将登录方式从用户名改为邮箱，并引入验证码机制增强安全性。

### 现有架构约束

- 数据库：SQLite + Drizzle ORM（同步 API）
- 认证：JWT（jose v6，7 天有效期）+ bcrypt v6
- 限流：内存级（`lib/auth/rate-limit.ts`）
- 密码加密：AES-256-GCM（用于 AI Config，复用加密模块）

## 目标 / 非目标

**目标：**

- 邮箱作为唯一登录凭证
- 验证码机制（注册、密码重置）
- 密码重置功能
- 组合频率限制（email + IP）

**非目标：**

- OAuth 第三方登录
- 邮箱变更功能
- 旧用户数据迁移

## 技术决策

### 1. 邮件服务：Nodemailer + SMTP

**选择理由：**
- 灵活支持任意 SMTP 服务商（阿里云、腾讯企业邮、Gmail 等）
- 社区成熟，TypeScript 支持良好
- 无需绑定特定云服务

**备选方案：**
- Resend：API 现代但国内访问不稳定
- SendGrid：免费额度少（100 封/天）
- 第三方 Auth 服务：定制性差

### 2. 用户模型变更

```
users 表变更：
  username (唯一) → nickname (可重复，可选)
  + email (唯一，必填)
  + emailVerified (boolean)

nickname 默认值：email 前缀（@ 之前的部分）
```

**理由：** 昵称作为显示名更友好，email 作为唯一标识更符合现代应用习惯。

### 3. 验证码存储

新增 `verification_codes` 表，SQLite 存储：

```sql
CREATE TABLE verification_codes (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,        -- 6 位数字
  type TEXT NOT NULL,        -- 'register' | 'reset_password'
  created_at INTEGER,
  expires_at INTEGER
);
CREATE INDEX idx_verification_email_type ON verification_codes(email, type);
```

**理由：**
- 单机部署，无需 Redis
- 验证成功后删除该 email+type 所有记录
- 定期清理过期记录（可选）

### 4. 频率限制策略

| 场景 | 限制 | 键 |
|------|------|-----|
| 发送验证码 | 60 秒间隔 | `send-code:{email}` |
| 验证码校验（按 email） | 5 次/15 分钟 | `verify:{email}` |
| 验证码校验（按 IP） | 10 次/15 分钟 | `verify:{ip}` |

**组合策略：** 两个维度同时检查，任一超限即拒绝。

### 5. 邮件模板

使用 HTML 模板，存储在 `lib/email-templates/`：

```
lib/email-templates/
├── verification-code.ts   # 验证码邮件
└── index.ts               # 模板导出
```

### 6. API 端点设计

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/send-code` | POST | 发送验证码 |
| `/api/auth/register` | POST | 注册（需验证码） |
| `/api/auth/login` | POST | 登录（email + password） |
| `/api/auth/reset-password` | POST | 重置密码 |

### 7. 前端页面

| 页面 | 路径 | 组件类型 |
|------|------|----------|
| 登录 | `/login` | Client Component |
| 注册 | `/register` | Client Component |
| 忘记密码 | `/forgot-password` | Client Component |
| 重置密码 | `/reset-password` | Client Component |

## 风险与权衡

| 风险 | 缓解措施 |
|------|----------|
| 邮件进入垃圾箱 | 配置 SPF/DKIM，使用可信 SMTP 服务 |
| 验证码暴力破解 | 组合频率限制（email + IP） |
| SMTP 密码泄露 | 使用应用专用密码，不提交到代码库 |
| 现有用户无法登录 | 开发阶段可接受，生产需迁移脚本 |

## 模块结构

```
lib/auth/
├── email.ts              # 邮件发送（Nodemailer）
├── verification.ts       # 验证码生成/校验/清理
├── rate-limit.ts         # 增强：支持多维度限制
├── password.ts           # 已有
├── jwt.ts                # 已有
└── encryption.ts         # 已有

lib/email-templates/
├── verification-code.ts  # 验证码 HTML 模板
└── index.ts

app/api/auth/
├── send-code/route.ts    # 新增
├── register/route.ts     # 修改
├── login/route.ts        # 修改
└── reset-password/route.ts  # 新增

app/(auth)/
├── login/page.tsx        # 修改
├── register/page.tsx     # 修改
├── forgot-password/page.tsx  # 新增
└── reset-password/page.tsx   # 新增
```

## 环境变量

```env
# 邮件服务（新增）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
EMAIL_FROM="Re:Flow <noreply@example.com>"
```
