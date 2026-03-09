## 1. 基础设施

- [x] 1.1 创建 `app/api/queue/add/` 目录结构

## 2. 入队 API 端点

- [x] 2.1 编写 `app/api/queue/add/route.ts` 失败用例（Red）：验证参数校验、权限检查
- [x] 2.2 实现 `POST /api/queue/add` 端点功能使测试通过（Green）
- [x] 2.3 运行 `pnpm test __tests__/app/api/queue/add/` 并确认全部通过

## 3. 客户端 API 函数

- [x] 2.4 编写 `lib/api/queue.ts` 的 `addToQueue()` 失败用例（Red）
- [x] 2.5 实现 `addToQueue()` 函数使测试通过（Green）
- [x] 2.6 运行 `pnpm test __tests__/lib/api/queue.test.ts` 并确认全部通过

## 4. UI 组件修改

- [x] 4.1 编写手工测试用例 ProcessDialog：Given 用户选择模板点击开始处理 / When 调用入队 API / Then 显示 Toast 并关闭弹窗

**Manual Test Cases:**
- TC1: 选择模板入队成功 → 显示"已加入队列"Toast
- TC2: 选择管道入队成功 → 显示"已加入队列"Toast
- TC3: 文章已在队列中 → 显示"该文章已在队列中"Toast
- TC4: 入队失败 → 显示错误 Toast
- [x] 4.2 修改 `ProcessDialog.tsx`：将 `processArticle()` 改为调用 `addToQueue()`，添加 Toast 提示
- [x] 4.3 修改 `ProcessButton.tsx`：移除 `isProcessing` 状态（入队是瞬时操作）
- [x] 4.4 手工验证 ProcessDialog：选择模板入队成功显示"已加入队列"Toast
- [x] 4.5 手工验证 ProcessDialog：文章已在队列中显示"该文章已在队列中"Toast

## 5. 代码质量检查

- [x] 5.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 5.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
