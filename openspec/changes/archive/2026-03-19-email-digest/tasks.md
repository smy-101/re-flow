## 1. 数据库基础设施

- [x] 1.1 在 `lib/db/schema.ts` 中新增 `email_digest_configs` 表定义
- [x] 1.2 在 `lib/db/schema.ts` 中新增 `email_digest_filters` 表定义
- [x] 1.3 在 `lib/db/schema.ts` 中新增 `email_digest_logs` 表定义
- [x] 1.4 在 `lib/db/schema.ts` 中添加表关联关系（relations）
- [x] 1.5 运行 `pnpm exec drizzle-kit generate` 生成迁移文件
- [x] 1.6 运行 `pnpm exec drizzle-kit migrate` 应用迁移

## 2. 时区与调度工具（TDD）

- [x] 2.1 编写 `lib/digest/scheduler.ts` 失败用例：计算下次发送时间、时区转换（Red）
- [x] 2.2 实现 `lib/digest/scheduler.ts` 功能使测试通过（Green）
- [x] 2.3 运行 `pnpm test __tests__/lib/digest/scheduler.test.ts` 并确认全部通过

## 3. 邮件内容构建（TDD）

- [x] 3.1 编写 `lib/digest/content-builder.ts` 失败用例：查询未读文章、应用筛选规则、获取 AI 处理结果（Red）
- [x] 3.2 实现 `lib/digest/content-builder.ts` 功能使测试通过（Green）
- [x] 3.3 运行 `pnpm test __tests__/lib/digest/content-builder.test.ts` 并确认全部通过

## 4. 邮件模板

- [x] 4.1 创建 `lib/email-templates/digest-email.ts`：实现邮件 HTML 模板
- [x] 4.2 模板支持按分类分组显示
- [x] 4.3 模板支持 AI 处理结果格式和简洁格式
- [x] 4.4 模板包含页脚（统计、退订链接、UTM 参数）

## 5. 邮件发送逻辑（TDD）

- [x] 5.1 编写 `lib/digest/sender.ts` 失败用例：发送邮件、更新配置状态、失败重试逻辑（Red）
- [x] 5.2 实现 `lib/digest/sender.ts` 功能使测试通过（Green）
- [x] 5.3 运行 `pnpm test __tests__/lib/digest/sender.test.ts` 并确认全部通过

## 6. Worker 进程

- [x] 6.1 创建 `lib/digest/worker.ts`：实现定时检查逻辑
- [x] 6.2 Worker 每 5 分钟检查待发送配置
- [x] 6.3 Worker 顺序处理用户，间隔 500ms
- [x] 6.4 添加优雅关闭处理（SIGINT/SIGTERM）
- [x] 6.5 在 `package.json` 中添加 `worker:digest` 脚本

## 7. API 路由

- [x] 7.1 创建 `app/api/digest-config/route.ts`：GET/PUT/DELETE 配置
- [x] 7.2 验证邮箱已验证才能开启推送
- [x] 7.3 计算并返回 nextSendAt

## 8. 前端 API 封装

- [x] 8.1 创建 `lib/api/digest-config.ts`：封装 API 调用函数

## 9. 前端设置页面

- [x] 9.1 创建 `app/(dashboard)/settings/digest/page.tsx`：推送设置页面
- [x] 9.2 实现推送开关组件（使用 checkbox）
- [x] 9.3 实现频率选择组件（每日/每周/自定义天数）
- [x] 9.4 实现时间选择器（HH:mm）和时区选择器
- [x] 9.5 实现筛选规则配置（全部/按分类/按订阅源）
- [x] 9.6 实现推送后标记已读开关
- [x] 9.7 实现推送状态显示（上次发送/下次发送/暂停状态）
- [x] 9.8 更新 `lib/config/navigation.ts` 添加设置页导航

## 10. 集成测试与回归

- [x] 10.1 运行 `pnpm test __tests__/lib/digest/` 并确认全部通过
- [x] 10.2 运行 `pnpm test __tests__/app/api/digest-config/` 并确认全部通过
- [x] 10.3 启动 `pnpm dev` 和 `pnpm worker:digest`，手工验证完整流程
  - Lint 和类型检查通过，API 测试通过
  - 修复 worker:digest 脚本使用正确的入口点加载环境变量
  - 手动验证通过：邮件发送成功

## 11. 代码质量检查

- [x] 11.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 11.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
