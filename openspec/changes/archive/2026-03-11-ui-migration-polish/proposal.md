## 背景与动机

上一轮设计系统迁移已建立 shadcn/ui 基础设施和主题 token，但部分低频组件仍使用硬编码 `gray-*` 颜色，导致暗色模式下视觉不一致。同时，现有页面缺乏微交互和视觉层次感，未通过 Web Interface Guidelines 的可访问性和体验检查。本次 change 旨在完成剩余组件的迁移，统一视觉语言，并提升整体用户体验。

## What Changes

- 将所有剩余组件的硬编码颜色替换为语义化 token（`bg-card`、`text-foreground`、`border-border` 等）
- 为交互元素添加微交互动画（hover、active、focus 状态）
- 改善间距节奏和视觉层次感
- 通过 Vercel Web Interface Guidelines 检查并修复问题

## Capabilities

### New Capabilities

- `visual-polish`: 定义组件迁移、视觉增强和 Guidelines 检查的统一标准

### Modified Capabilities

无（本次仅涉及样式层面，不改变 spec 级别的行为要求）

## Impact

影响以下文件：
- `components/ai/AIConfigCard.tsx`
- `components/craft/CraftTemplateCard.tsx`
- `components/pipeline/PipelineCard.tsx`
- `components/processing/ProcessDialog.tsx`
- `components/mcp/MCPTokenManager.tsx`
- `components/mcp/MCPTokenDetail.tsx`
- `app/(dashboard)/items/[itemId]/page.tsx`

## 非目标（Non-goals）

不修改业务逻辑、API 或数据库 schema；不添加新功能；不重构已有良好样式的组件。
