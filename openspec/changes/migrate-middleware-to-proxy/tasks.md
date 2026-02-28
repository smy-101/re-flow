## 1. 迁移执行

- [x] 1.1 运行 Next.js codemod 迁移 middleware 到 proxy
- [x] 1.2 检查 `git diff` 确认变更正确（文件重命名 + 函数重命名）

## 2. 验证测试

- [x] 2.1 运行 `pnpm exec tsc --noEmit` 确认零类型错误
- [x] 2.2 启动开发服务器 `pnpm dev` 确认无弃用警告
- [ ] 2.3 手动测试登录功能确认 JWT 认证正常工作

## 3. 最终检查

- [x] 3.1 运行 `pnpm test` 确认所有测试通过（如有）
- [x] 3.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
