## 1. 数据库基础设施

- [ ] 1.1 在 `lib/db/schema.ts` 中添加 `processingResults` 表定义及相关类型导出
- [ ] 1.2 运行 `pnpm exec drizzle-kit generate` 生成迁移文件
- [ ] 1.3 运行 `pnpm exec drizzle-kit migrate` 应用迁移

## 2. 核心处理逻辑

- [ ] 2.1 创建 `lib/processing/prompt-renderer.ts` 实现 Prompt 模板变量渲染
- [ ] 2.2 创建 `lib/processing/executor.ts` 实现模板处理执行逻辑
- [ ] 2.3 创建 `lib/processing/pipeline-executor.ts` 实现管道处理执行逻辑
- [ ] 2.4 运行 `pnpm test __tests__/lib/processing/` 并确认全部通过

## 3. API 层实现

- [ ] 3.1 创建 `app/api/process/route.ts` 实现处理 API（POST）
- [ ] 3.2 创建 `app/api/processing-results/route.ts` 实现 GET（列表）端点
- [ ] 3.3 创建 `app/api/processing-results/[id]/route.ts` 实现 GET（详情）端点
- [ ] 3.4 创建 `app/api/feed-items/[id]/processing-results/route.ts` 实现获取文章处理历史
- [ ] 3.5 创建 `lib/api/processing-results.ts` 封装前端 API 调用函数
- [ ] 3.6 运行 `pnpm test __tests__/lib/api/processing-results.test.ts` 并确认全部通过

## 4. 前端组件实现

- [ ] 4.1 创建 `components/processing/ProcessButton.tsx` 处理触发按钮组件
- [ ] 4.2 创建 `components/processing/ProcessDialog.tsx` 处理选项弹窗组件
- [ ] 4.3 创建 `components/processing/ProcessProgress.tsx` 处理进度显示组件
- [ ] 4.4 创建 `components/processing/ResultViewer.tsx` 结果查看器组件（Tab 切换）
- [ ] 4.5 创建 `components/processing/ProcessingHistory.tsx` 处理历史列表组件

## 5. 页面修改

- [ ] 5.1 修改 `app/(dashboard)/items/[id]/page.tsx` 添加处理入口和结果切换功能

## 6. 测试与验证

- [ ] 6.1 运行 `pnpm test __tests__/lib/processing/` 并确认全部通过
- [ ] 6.2 运行 `pnpm test __tests__/lib/api/processing-results.test.ts` 并确认全部通过
- [ ] 6.3 手工验证文章处理：选择模板处理、选择管道处理
- [ ] 6.4 手工验证处理进度：loading 状态显示
- [ ] 6.5 手工验证原文/结果切换：Tab 切换正常、内容正确
- [ ] 6.6 手工验证处理历史：历史记录展示、选择查看历史结果
- [ ] 6.7 手工验证处理失败：错误信息显示、重试功能

## 7. 代码质量检查

- [ ] 7.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [ ] 7.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
