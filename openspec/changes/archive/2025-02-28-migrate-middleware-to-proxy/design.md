## Context

当前项目使用 Next.js 16，在项目根目录有 `middleware.ts` 文件用于 JWT 认证。Next.js 官方已将 `middleware` 文件约定重命名为 `proxy`，以避免与 Express.js middleware 混淆，并明确其作为网络边界代理的定位。

现有 `middleware.ts` 实现了：
- 公开路由白名单检查
- JWT token 验证（从 Cookie 读取）
- 认证失败重定向到 `/login`

## Goals / Non-Goals

**Goals:**
- 将 `middleware.ts` 重命名为 `proxy.ts`
- 将导出函数 `middleware()` 重命名为 `proxy()`
- 保持现有功能逻辑完全不变

**Non-Goals:**
- 不修改认证逻辑
- 不改变路由匹配规则
- 不调整 JWT 验证行为

## Decisions

### 1. 迁移方式选择

**选择**: 使用 Next.js 官方 codemod 自动迁移

**理由**:
- 官方工具，安全可靠
- 自动处理文件重命名和函数重命名
- 减少人为错误

**手动执行作为备选方案**: 如果 codemod 失败，可手动：
1. 将 `middleware.ts` 重命名为 `proxy.ts`
2. 将 `export function middleware()` 改为 `export function proxy()`

### 2. 验证策略

迁移后需要验证：
1. 运行 `pnpm dev` 确认无弃用警告
2. 测试登录/登出流程确认功能正常
3. 运行 `pnpm exec tsc --noEmit` 确认类型检查通过

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Codemod 可能修改不完整 | 运行后检查文件内容，确认函数名已更新 |
| 可能遗漏相关代码引用 | Git diff 查看所有变更，确保无遗漏 |
| 运行时行为可能意外改变 | 迁移后立即手动测试登录流程 |

## Migration Plan

1. **备份当前状态**（Git 已有版本控制）
2. **运行 codemod**: `npx @next/codemod@canary middleware-to-proxy .`
3. **检查变更**: 使用 `git diff` 确认只修改了文件名和函数名
4. **类型检查**: `pnpm exec tsc --noEmit`
5. **功能测试**: 启动开发服务器，测试登录受保护页面
6. **提交变更**: `git commit` 记录迁移

**回滚策略**: 如有问题，直接 `git checkout middleware.ts` 恢复原文件。

## Open Questions

无（这是官方推荐的标准化迁移）。
