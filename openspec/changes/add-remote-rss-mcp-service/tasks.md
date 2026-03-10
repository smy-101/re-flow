## 1. 基础设施与数据模型

- [ ] 1.1 新增 MCP token 数据表、字段与迁移文件到 lib/db/
- [ ] 1.2 抽取共享业务内核目录与模块边界（caller context、token scope、文章组合视图）
- [ ] 1.3 更新设置导航与独立 MCP 页面路由占位到 app/(dashboard)/settings/

## 2. Token 认证与授权内核

- [ ] 2.1 编写 __tests__/lib/auth/ 与共享内核的 MCP token 校验失败用例（Red）
- [ ] 2.2 运行 pnpm test __tests__/lib/auth/ 并确认新用例先失败（Red）
- [ ] 2.3 实现 lib/auth/ 中的 token 生成、摘要存储、状态校验与 caller context 解析（Green）
- [ ] 2.4 编写 __tests__/lib/ 共享内核的 feed 白名单、时间窗口、raw fallback 授权用例（Red）
- [ ] 2.5 运行 pnpm test __tests__/lib/ 并确认新增授权用例先失败（Red）
- [ ] 2.6 实现共享业务内核的 scope 校验与请求收缩规则（Green）
- [ ] 2.7 运行 pnpm test __tests__/lib/auth/ __tests__/lib/ 并确认全部通过（Green）

## 3. 文章组合视图聚合

- [ ] 3.1 编写 __tests__/lib/ 文章组合视图聚合失败用例：最新成功结果优先、pending/error 回退、原文裁剪（Red）
- [ ] 3.2 运行 pnpm test __tests__/lib/ 并确认新增聚合用例先失败（Red）
- [ ] 3.3 实现共享业务内核中的文章组合视图查询与结构化状态映射（Green）
- [ ] 3.4 运行 pnpm test __tests__/lib/ 并确认组合视图相关用例通过（Green）

## 4. Token API 与设置页面

- [ ] 4.1 编写手工测试用例 app/(dashboard)/settings/mcp/page.tsx：创建、列表、启用/禁用、删除的 Given/When/Then 验收场景
- [ ] 4.2 编写 __tests__/lib/api/ 或相关路由模块的 MCP token API 失败用例（Red）
- [ ] 4.3 运行 pnpm test __tests__/lib/api/ 并确认新增 token API 用例先失败（Red）
- [ ] 4.4 实现 app/api/mcp-tokens 与 app/api/mcp-tokens/[id] 的创建、列表、详情、启用/禁用、删除接口（Green）
- [ ] 4.5 实现 app/(dashboard)/settings/mcp/page.tsx 与 app/(dashboard)/settings/mcp/[id]/page.tsx 的列表、详情和一步式创建交互
- [ ] 4.6 手工验证 app/(dashboard)/settings/mcp/：仅一次展示 secret、列表字段、详情权限信息、状态操作
- [ ] 4.7 运行 pnpm test __tests__/lib/api/ 并确认 MCP token API 相关用例通过（Green）

## 5. 远程 MCP 服务

- [ ] 5.1 编写 __tests__/lib/ 或独立 MCP 模块的最近文章列表与单篇详情工具失败用例（Red）
- [ ] 5.2 运行 pnpm test __tests__/lib/ 并确认新增 MCP 读取用例先失败（Red）
- [ ] 5.3 实现独立 MCP 进程入口与远程 HTTP/SSE tools-only 接口
- [ ] 5.4 接入共享业务内核，完成最近文章组合视图列表与单篇详情工具
- [ ] 5.5 运行 pnpm test __tests__/lib/ 并确认 MCP 读取相关用例通过（Green）

## 6. 回归验证

- [ ] 6.1 手工验证远程 MCP 接入：bearer token、默认 20 条、最大 50 条、越权请求被拒绝
- [ ] 6.2 运行 pnpm lint 并确认无 error（无新增 warning）
- [ ] 6.3 运行 pnpm exec tsc --noEmit 确认零类型错误
