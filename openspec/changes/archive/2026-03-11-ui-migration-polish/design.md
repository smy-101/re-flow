## Context

上一轮 `design-system-shadcn-dark-mode` change 已完成基础设施和高频组件的迁移，但以下组件仍使用硬编码 `gray-*` 颜色：

| 组件 | 问题 |
|------|------|
| `AIConfigCard.tsx` | `bg-white`, `text-gray-900`, `border-gray-200` |
| `CraftTemplateCard.tsx` | `bg-white`, `text-gray-900`, `bg-gray-50` |
| `PipelineCard.tsx` | `bg-white`, `text-gray-900`, `bg-gray-50` |
| `ProcessDialog.tsx` | 旧 `Modal` 组件 + 大量 `gray-*` 颜色 |
| `items/[itemId]/page.tsx` | 内联 `text-gray-*`, `bg-gray-*` 样式 |
| `MCPTokenManager.tsx` | 混合语义化 token 和硬编码颜色 |
| `MCPTokenDetail.tsx` | 硬编码颜色 |

## Goals / Non-Goals

**Goals:**
- 将所有剩余组件的硬编码颜色替换为语义化 token
- 添加微交互动画（hover、active、focus 状态过渡）
- 改善间距节奏（使用 4px 基线的 spacing scale）
- 增强视觉层次感（通过 shadow、border、background 区分层级）
- 通过 Vercel Web Interface Guidelines 检查

**Non-Goals:**
- 不修改业务逻辑或 API
- 不添加新功能
- 不重构已有良好样式的组件
- 不改变组件的 DOM 结构（除非必要）

## Decisions

### 1. 颜色迁移策略

**决策**: 使用语义化 token 替换硬编码颜色

| 硬编码 | 语义化 Token |
|--------|--------------|
| `bg-white` | `bg-card` |
| `text-gray-900` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `border-gray-200` | `border-border` |
| `bg-gray-50` | `bg-muted` |
| `hover:bg-gray-100` | `hover:bg-secondary` |

**理由**: 语义化 token 自动适配亮暗模式，无需手动维护 `dark:` 变体。

### 2. 视觉增强方案

**决策**: 渐进式添加微交互，不引入新的动画库

- **过渡**: 使用 `transition-colors` 或 `transition-[color,box-shadow]`（已在 Button 中使用）
- **时长**: 150ms（快速响应）或 200ms（标准）
- **曲线**: `ease-in-out`（默认）或 `ease-out`（进入动画）
- **hover 效果**: `hover:shadow-md`、`hover:border-border`、`hover:bg-secondary`
- **focus 效果**: 使用已有的 `focus-visible:ring-2 focus-visible:ring-ring`

**理由**: 复用 Tailwind 内置能力，保持一致性，避免引入额外依赖。

### 3. ProcessDialog 迁移

**决策**: 将 `Modal` 替换为 `Dialog` 组件

**理由**:
- `Dialog` 已完成 shadcn/ui 迁移，支持语义化 token
- 保持与其他弹窗组件的一致性
- `Modal` 组件可在此后考虑移除

### 4. Guidelines 检查方法

**决策**: 分阶段检查，按类别修复

1. **Accessibility**: aria-label、label 关联、键盘处理
2. **Focus States**: focus-visible 支持
3. **Forms**: autocomplete、input type
4. **Animation**: prefers-reduced-motion 支持
5. **Content Handling**: truncate、line-clamp、min-w-0

**理由**: 分类处理便于追踪进度，避免遗漏。

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 迁移后暗色模式出现视觉回归 | 每个 component 迁移后立即在亮暗模式下目测验证 |
| 微交互影响性能 | 仅使用 CSS transition（GPU 加速），避免 JS 动画 |
| Guidelines 检查发现大量问题 | 优先修复高优先级（Accessibility、Focus），低优先级记录为后续改进 |
