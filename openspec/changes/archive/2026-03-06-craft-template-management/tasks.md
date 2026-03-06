## 1. 数据库基础设施

- [x] 1.1 在 `lib/db/schema.ts` 中添加 `craftTemplates` 表定义及相关类型导出
- [x] 1.2 在 `lib/db/schema.ts` 中添加 `aiConfigsRelations` 的 `craftTemplates` 关联
- [x] 1.3 运行 `pnpm exec drizzle-kit generate` 生成迁移文件
- [x] 1.4 运行 `pnpm exec drizzle-kit migrate` 应用迁移

## 2. API 层实现

- [x] 2.1 创建 `app/api/craft-templates/route.ts` 实现 GET（列表）和 POST（创建）端点
- [x] 2.2 创建 `app/api/craft-templates/[id]/route.ts` 实现 GET（详情）、PUT（更新）、DELETE（删除）端点
- [x] 2.3 修改 `app/api/ai-configs/[id]/route.ts` 的 DELETE 端点，添加关联模板检查逻辑
- [x] 2.4 创建 `lib/api/craft-templates.ts` 封装前端 API 调用函数

## 3. 预设模板定义

- [x] 3.1 创建 `lib/craft-templates/presets.ts` 定义预设模板常量数组

## 4. 前端组件实现

- [x] 4.1 创建 `components/craft/CraftTemplateCard.tsx` 模板卡片组件
- [x] 4.2 创建 `components/craft/CraftTemplateForm.tsx` 模板表单组件（复用于创建和编辑）
- [x] 4.3 创建 `components/craft/PromptEditor.tsx` Prompt 编辑器组件（带变量提示）
- [x] 4.4 创建 `components/craft/PresetTemplateGallery.tsx` 预设模板库弹窗组件
- [x] 4.5 创建 `components/craft/CraftTemplateList.tsx` 模板列表组件

## 5. 页面实现

- [x] 5.1 创建 `app/(dashboard)/settings/craft/page.tsx` 模板列表页面
- [x] 5.2 创建 `app/(dashboard)/settings/craft/new/page.tsx` 创建模板页面
- [x] 5.3 创建 `app/(dashboard)/settings/craft/[id]/edit/page.tsx` 编辑模板页面

## 6. 测试与验证

- [x] 6.1 运行 `pnpm test __tests__/lib/api/craft-templates.test.ts` 并确认全部通过
- [x] 6.2 手工验证模板列表页面：展示、空状态、卡片样式
- [x] 6.3 手工验证创建模板：表单验证、AI 配置选择、Prompt 编辑器变量提示
- [x] 6.4 手工验证编辑模板：数据回填、更新保存
- [x] 6.5 手工验证删除模板：确认对话框、删除成功
- [x] 6.6 手工验证预设模板库：浏览、复制使用
- [x] 6.7 手工验证 AI Config 删除保护：存在关联模板时拒绝删除并显示提示

## 7. 代码质量检查

- [x] 7.1 运行 `pnpm lint` 并确认无 error（无新增 warning）
- [x] 7.2 运行 `pnpm exec tsc --noEmit` 确认零类型错误
