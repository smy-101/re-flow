## 1. 数据库基础设施

- [ ] 1.1 更新 users schema：username → nickname（可重复），新增 email（唯一）、emailVerified 字段
- [ ] 1.2 创建 verification_codes schema：id、email、code、type、createdAt、expiresAt
- [ ] 1.3 运行 `pnpm exec drizzle-kit generate` 生成迁移文件
- [ ] 1.4 运行 `pnpm exec drizzle-kit migrate` 应用迁移
- [ ] 1.5 删除 local.db 重建数据库（开发阶段，直接清空数据）

## 2. 验证码模块（lib/auth/verification.ts）

- [ ] 2.1 编写 verification.ts 失败用例（Red）：生成/存储/验证/清理/过期检查
- [ ] 2.2 实现 generateVerificationCode：生成 6 位数字验证码
- [ ] 2.3 实现 storeVerificationCode：存储验证码到数据库（10 分钟过期）
- [ ] 2.4 实现 verifyCode：验证验证码正确性和有效期
- [ ] 2.5 实现 cleanupCodes：删除指定 email+type 的所有验证码
- [ ] 2.6 实现 canSendCode：检查是否满足 60 秒发送间隔
- [ ] 2.7 运行 `pnpm test __tests__/lib/auth/verification.test.ts` 并确认全部通过（Green）

## 3. 邮件发送模块（lib/auth/email.ts）

- [ ] 3.1 编写 email.ts 失败用例（Red）：邮件发送/配置验证
- [ ] 3.2 添加 nodemailer 依赖：`pnpm add nodemailer && pnpm add -D @types/nodemailer`
- [ ] 3.3 实现 createTransporter：创建 SMTP 传输器
- [ ] 3.4 实现 sendVerificationEmail：发送验证码邮件
- [ ] 3.5 运行 `pnpm test __tests__/lib/auth/email.test.ts` 并确认全部通过（Green）

## 4. 邮件模板（lib/email-templates/）

- [ ] 4.1 创建 lib/email-templates/verification-code.ts：HTML 验证码邮件模板
- [ ] 4.2 创建 lib/email-templates/index.ts：统一导出

## 5. 频率限制增强（lib/auth/rate-limit.ts）

- [ ] 5.1 编写 rate-limit.ts 增强用例（Red）：多维度组合限制
- [ ] 5.2 实现组合限制逻辑：支持 email + IP 双维度检查
- [ ] 5.3 运行 `pnpm test __tests__/lib/auth/rate-limit.test.ts` 并确认全部通过（Green）

## 6. 发送验证码 API（POST /api/auth/send-code）

- [ ] 6.1 编写 send-code API 失败用例（Red）：成功发送/频率限制/参数校验
- [ ] 6.2 实现 app/api/auth/send-code/route.ts：发送验证码接口
- [ ] 6.3 运行 `pnpm test __tests__/app/api/auth/send-code.test.ts` 并确认全部通过（Green）

## 7. 注册 API 改造（POST /api/auth/register）

- [ ] 7.1 编写 register API 改造用例（Red）：email 参数/验证码校验/nickname 默认值
- [ ] 7.2 修改 app/api/auth/register/route.ts：email 登录 + 验证码校验 + nickname 处理
- [ ] 7.3 运行 `pnpm test __tests__/app/api/auth/register.test.ts` 并确认全部通过（Green）

## 8. 登录 API 改造（POST /api/auth/login）

- [ ] 8.1 编写 login API 改造用例（Red）：email 参数/错误信息变更
- [ ] 8.2 修改 app/api/auth/login/route.ts：username → email
- [ ] 8.3 运行 `pnpm test __tests__/app/api/auth/login.test.ts` 并确认全部通过（Green）

## 9. 重置密码 API（POST /api/auth/reset-password）

- [ ] 9.1 编写 reset-password API 失败用例（Red）：验证码校验/密码更新/频率限制
- [ ] 9.2 实现 app/api/auth/reset-password/route.ts：重置密码接口
- [ ] 9.3 运行 `pnpm test __tests__/app/api/auth/reset-password.test.ts` 并确认全部通过（Green）

## 10. 前端 API 客户端（lib/api/）

- [ ] 10.1 创建 lib/api/auth.ts：sendCode、resetPassword 函数
- [ ] 10.2 更新 lib/api/ 相关类型定义

## 11. 前端页面改造

- [ ] 11.1 编写手工测试用例 /login：Given 已注册用户 / When 使用 email 登录 / Then 成功跳转仪表盘
- [ ] 11.2 修改登录页面：username 输入改为 email 输入
- [ ] 11.3 手工验证 /login：email 登录成功、错误信息正确显示

- [ ] 11.4 编写手工测试用例 /register：Given 有效邮箱 / When 填写邮箱+密码+验证码 / Then 注册成功
- [ ] 11.5 修改注册页面：添加验证码输入、nickname 可选、发送验证码按钮
- [ ] 11.6 手工验证 /register：验证码发送、60秒倒计时、注册成功

- [ ] 11.7 编写手工测试用例 /forgot-password：Given 已注册邮箱 / When 请求重置 / Then 发送验证码
- [ ] 11.8 创建 app/(auth)/forgot-password/page.tsx：忘记密码页面
- [ ] 11.9 手工验证 /forgot-password：邮箱输入、发送验证码成功

- [ ] 11.10 编写手工测试用例 /reset-password：Given 有效验证码 / When 填写新密码 / Then 重置成功
- [ ] 11.11 创建 app/(auth)/reset-password/page.tsx：重置密码页面
- [ ] 11.12 手工验证 /reset-password：验证码校验、密码重置成功

## 12. 环境变量与文档

- [ ] 12.1 添加 SMTP 环境变量到 .env.local.example：SMTP_HOST、SMTP_PORT、SMTP_SECURE、SMTP_USER、SMTP_PASS、EMAIL_FROM
- [ ] 12.2 更新 CLAUDE.md：新增邮件服务配置说明

## 13. 代码质量检查

- [ ] 13.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [ ] 13.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
