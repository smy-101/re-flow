## 1. 基础设施

- [x] 1.1 创建 `lib/auth/ip.ts` 模块，定义 `getClientIp` 函数签名
- [x] 1.2 创建 `lib/auth/auth-helper.ts` 模块，定义 `getAuthenticatedUser` 函数签名
- [x] 1.3 创建 `lib/auth/env.ts` 模块，定义 `validateEnv` 函数签名
- [x] 1.4 更新 `tsconfig.json`，在 `compilerOptions.types` 数组中添加 `"vitest/globals"`

## 2. 环境变量验证

- [x] 2.1 实现 `validateEnv` 函数，验证 JWT_SECRET 和 CRON_SECRET
- [x] 2.2 在验证失败时输出清晰的中文错误消息并调用 `process.exit(1)`
- [x] 2.3 更新 `lib/auth/jwt.ts`，移除 JWT_SECRET 的空字符串默认值，改为抛出启动时错误
- [x] 2.4 创建 `lib/init.ts` 模块，在应用启动时调用 `validateEnv`
- [x] 2.5 在 `app/layout.tsx` 顶部导入并调用初始化模块

## 3. IP 地址获取

- [x] 3.1 实现 `getClientIp` 函数，按优先级检查 HTTP 头（CF-Connecting-IP → X-Client-IP → X-Forwarded-For 最后一个 → X-Real-IP → unknown）
- [x] 3.2 添加 IP 地址格式验证逻辑，跳过无效的 IP
- [x] 3.3 编写 IP 获取函数的单元测试，覆盖所有优先级分支
- [x] 3.4 更新 `app/api/auth/login/route.ts`，使用新的 `getClientIp` 函数替换现有的 IP 获取逻辑

## 4. 时序安全比较

- [x] 4.1 更新 `app/api/feeds/refresh-all/route.ts`，使用 `crypto.timingSafeEqual` 替换 CRON_SECRET 的 `!==` 比较
- [x] 4.2 处理 Buffer 长度不同的情况，先比较长度再使用恒定时间比较
- [ ] 4.3 验证修改后的代码仍能正确拒绝无效的 CRON_SECRET

## 5. 认证辅助函数

- [x] 5.1 实现 `getAuthenticatedUser` 函数，从 cookie 获取 token 并验证，返回 `number | NextResponse`
- [x] 5.2 添加 JSDoc 注释和使用示例，说明联合返回类型的处理方式
- [x] 5.3 编写认证辅助函数的单元测试，覆盖成功、token 缺失、token 无效场景
- [x] 5.4 更新 `app/api/feeds/route.ts`，使用 `getAuthenticatedUser` 替换重复的认证逻辑
- [x] 5.5 更新 `app/api/feeds/[id]/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.6 更新 `app/api/feeds/[id]/mark-all-read/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.7 更新 `app/api/feeds/[id]/refresh/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.8 更新 `app/api/items/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.9 更新 `app/api/items/[id]/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.10 更新 `app/api/items/[id]/read/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.11 更新 `app/api/items/[id]/favorite/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.12 更新 `app/api/items/mark-all-read/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.13 更新 `app/api/categories/route.ts`，使用 `getAuthenticatedUser`
- [x] 5.14 更新 `app/api/feeds/validate/route.ts`，使用 `getAuthenticatedUser`

## 6. 测试

- [x] 6.1 运行 `pnpm test` 并确认全部通过（无失败/无报错）
- [ ] 6.2 手动测试登录功能，验证速率限制仍然有效
- [ ] 6.3 手动测试 RSS worker 的 refresh-all API，验证 CRON_SECRET 认证正常工作

## 7. 代码质量检查

- [x] 7.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 7.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
