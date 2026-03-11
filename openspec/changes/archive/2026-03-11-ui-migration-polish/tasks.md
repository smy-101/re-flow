## 1. 手工测试用例编写

- [x] 1.1 编写手工测试用例 组件迁移：Given 用户在亮色和暗色模式下访问 AI/Craft/Pipeline 设置页面 When 查看卡片组件 Then 卡片使用语义化 token 渲染且视觉一致
- [x] 1.2 编写手工测试用例 ProcessDialog：Given 用户在暗色模式下打开处理文章对话框 When 查看对话框内容 Then 对话框背景和文字使用语义化 token 且可读
- [x] 1.3 编写手工测试用例 文章详情页：Given 用户在亮色和暗色模式下访问文章详情页 When 查看页面内容 Then 所有元素使用语义化 token 且层次分明
- [x] 1.4 编写手工测试用例 微交互：Given 用户与按钮/卡片交互 When hover/focus/active 状态变化 Then 过渡动画平滑且响应迅速
- [x] 1.5 编写手工测试用例 可访问性：Given 用户使用键盘导航 When Tab 到交互元素 Then 元素显示 focus-visible 焦点环

## 2. 卡片组件迁移

- [x] 2.1 迁移 AIConfigCard.tsx：将 bg-white、text-gray-*、border-gray-* 替换为语义化 token
- [x] 2.2 迁移 CraftTemplateCard.tsx：将硬编码颜色替换为语义化 token
- [x] 2.3 迁移 PipelineCard.tsx：将硬编码颜色替换为语义化 token
- [x] 2.4 为上述卡片组件添加 hover:shadow-md 和 transition-shadow 微交互

## 3. ProcessDialog 迁移

- [x] 3.1 将 ProcessDialog.tsx 中的 Modal 替换为 Dialog 组件
- [x] 3.2 将 ProcessDialog.tsx 中的 gray-* 颜色替换为语义化 token
- [x] 3.3 为 ProcessDialog 的选项卡和选项添加过渡动画

## 4. 页面内联样式迁移

- [x] 4.1 迁移 items/[itemId]/page.tsx：将内联 gray-* 颜色替换为语义化 token
- [x] 4.2 迁移 MCPTokenManager.tsx：统一使用语义化 token，移除混合模式
- [x] 4.3 迁移 MCPTokenDetail.tsx：将硬编码颜色替换为语义化 token

## 5. 视觉增强

- [x] 5.1 为所有可点击卡片添加 hover:shadow-md 过渡效果
- [x] 5.2 为按钮和链接添加 transition-colors 微交互
- [x] 5.3 检查并修复 flex 容器中的 min-w-0 问题（允许文本截断）
- [x] 5.4 添加 motion-reduce: 媒体查询支持（尊重 prefers-reduced-motion）

## 6. Web Interface Guidelines 检查

- [x] 6.1 检查 Accessibility：确保 icon-only buttons 有 aria-label
- [x] 6.2 检查 Accessibility：确保表单控件有 label 或 aria-label 关联
- [x] 6.3 检查 Focus States：确保交互元素有 focus-visible:ring-2
- [x] 6.4 检查 Forms：确保输入框有 autocomplete 属性
- [x] 6.5 检查 Content Handling：确保长文本容器有 truncate 或 line-clamp

## 7. 手工回归验证

- [ ] 7.1 手工验证 组件迁移：在亮色和暗色模式下访问所有已迁移组件页面，确认视觉一致
- [ ] 7.2 手工验证 ProcessDialog：在暗色模式下打开对话框，确认颜色正确
- [ ] 7.3 手工验证 微交互：测试按钮/卡片的 hover/focus 状态过渡
- [ ] 7.4 手工验证 可访问性：使用键盘 Tab 导航，确认焦点环可见

## 8. 代码质量检查

- [x] 8.1 运行 pnpm lint 并确认无 error（无新增 warning）
- [x] 8.2 运行 pnpm exec tsc --noEmit 确认零类型错误
