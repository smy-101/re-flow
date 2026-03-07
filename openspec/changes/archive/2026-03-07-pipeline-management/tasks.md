## 1. 数据库基础设施

- [x] 1.1 在 `lib/db/schema.ts` 中添加 `pipelines` 表定义及相关类型导出
- [x] 1.2 运行 `pnpm exec drizzle-kit generate` 生成迁移文件
- [x] 1.3 运行 `pnpm exec drizzle-kit migrate` 应用迁移

- [x] 1.4 运行 `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` 安装拖拽依赖

- [x] 1.5 运行 `pnpm install` 安装依赖

## 2. API 层实现

- [x] 2.1 创建 `app/api/pipelines/route.ts` 实现 GET（列表）和 POST（创建）端点
- [x] 2.2 创建 `app/api/pipelines/[id]/route.ts` 实现 GET（详情）、PUT（更新）、DELETE（删除）端点
- [x] 2.3 创建 `lib/api/pipelines.ts` 封装前端 API 调用函数

- [x] 2.4 运行 `pnpm test __tests__/lib/api/pipelines.test.ts` 并确认全部通过

## 3. 前端组件实现
- [x] 3.1 创建 `components/pipeline/PipelineCard.tsx` 管道卡片组件
- [x] 3.2 创建 `components/pipeline/PipelineForm.tsx` 管道表单组件（复用于创建和编辑）
- [x] 3.3 创建 `components/pipeline/PipelineStepEditor.tsx` 步骤编辑器组件（含拖拽排序）
- [x] 3.4 创建 `components/pipeline/PipelineStepItem.tsx` 步骤项组件（可拖拽）
- [x] 3.5 创建 `components/pipeline/PipelineList.tsx` 管道列表组件
- [x] 3.6 创建 `components/pipeline/TemplateSelector.tsx` 模板选择器组件

## 4. 页面实现
- [x] 4.1 创建 `app/(dashboard)/settings/pipelines/page.tsx` 管道列表页面
- [x] 4.2 创建 `app/(dashboard)/settings/pipelines/new/page.tsx` 创建管道页面
- [x] 4.3 创建 `app/(dashboard)/settings/pipelines/[id]/edit/page.tsx` 编辑管道页面

## 5. 测试与验证
- [x] 5.1 运行 `pnpm test __tests__/lib/api/pipelines.test.ts` 并确认全部通过
- [x] 5.2 手工验证管道列表页面：展示、空状态、卡片样式
- [x] 5.3 手工验证创建管道：表单验证、步骤添加
- [x] 5.4 手工验证编辑管道: 数据回填、步骤修改
- [x] 5.5 手工验证删除管道: 确认对话框、删除成功
- [x] 5.6 手工验证步骤拖拽排序: 拖拽交互、顺序保存
- [x] 5.7 手工验证管道可视化: 流程图展示

## 6. 代码质量检查
- [x] 6.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 6.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
