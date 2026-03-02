## 1. 删除冲突的路由目录

- [x] 1.1 删除 `app/api/feeds/[feedId]/` 目录及其所有内容

## 2. 创建正确的路由端点

- [x] 2.1 创建 `app/api/feeds/[id]/mark-all-read/route.ts` - 使用 `id` 参数名
- [x] 2.2 确认新端点功能与原实现一致

## 3. 验证修复

- [x] 3.1 启动开发服务器确认无路由冲突错误
- [x] 3.2 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 3.3 运行 `pnpm test` 并确认全部通过（无失败/无报错）
- [x] 3.4 运行 `pnpm exec tsc --noEmit` 确认零类型错误
