## Why

Next.js 16 已将 `middleware` 文件约定标记为废弃（deprecated），并重命名为 `proxy`。项目当前使用 `middleware.ts`，开发时会收到弃用警告。需要迁移到新的 `proxy` 约定以保持与 Next.js 最新版本一致，避免未来版本中可能的移除。

## What Changes

- **BREAKING**: 将 `middleware.ts` 重命名为 `proxy.ts`
- 将导出函数从 `export function middleware()` 改名为 `export function proxy()`
- 功能行为保持不变（仅重命名，无逻辑变更）

## Capabilities

### New Capabilities
- 无（这是重命名操作，非新功能）

### Modified Capabilities
- 无（规格层面无行为变更，仅 API 命名调整）

## Impact

**影响范围**：
- `middleware.ts` → `proxy.ts`（文件重命名）
- 导出函数名称变更
- 功能逻辑保持完全一致，JWT 认证行为不变

**无外部依赖变更**，无需安装新包。

**可使用官方 codemod 自动迁移**：
```bash
npx @next/codemod@canary middleware-to-proxy .
```
