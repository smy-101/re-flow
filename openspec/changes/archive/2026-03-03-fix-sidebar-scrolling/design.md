## Context

当前仪表盘布局使用 `min-h-screen`，当内容超过视口高度时，页面根元素会滚动。虽然顶部导航栏有 `sticky top-0` 定位保持固定，但侧边栏没有固定定位，导致用户滚动页面时侧边栏消失，无法访问导航按钮。

现有布局结构：
```
<div className="min-h-screen flex flex-col">
  <DashboardNavbar />  ← sticky top-0
  <div className="flex-1 flex">
    <Sidebar />         ← 无固定定位，会滚动
    <main className="overflow-auto" />
  </div>
</div>
```

## Goals / Non-Goals

**Goals:**
- 侧边栏在所有 dashboard 页面保持可见
- 滚动仅在主内容区域内部发生
- 保持移动端布局不变（使用抽屉导航）
- 最小化代码变更，降低引入新 bug 的风险

**Non-Goals:**
- 修改侧边栏的样式或行为
- 修改移动端布局
- 改变顶栏的 sticky 行为

## Decisions

### 决策 1: 使用 h-screen 替代 min-h-screen

**选择:** 将根容器从 `min-h-screen` 改为 `h-screen`

**理由:**
- `h-screen` 确保容器高度严格限制在视口高度内
- 配合现有的 `main overflow-auto`，实现内容区域内部滚动
- 最小改动，只需修改一个 CSS 类名

**替代方案比较:**
| 方案 | 改动量 | 风险 | 兼容性 |
|------|--------|------|--------|
| h-screen | 极小（1 处） | 低 | 高 |
| sticky sidebar | 中（Sidebar 组件） | 中 | 中 |
| fixed positioning | 大（多处） | 高 | 低 |

### 决策 2: 保持现有 flex 布局

**选择:** 保持 `flex flex-col` 和 `flex-1` 的结构不变

**理由:**
- 现有 flex 布局已经正确处理了导航栏和内容区域的空间分配
- `flex-1 flex` 确保侧边栏和主内容区域平分剩余空间
- 改变布局结构可能影响其他页面

### 决策 3: 不修改 Sidebar 组件

**选择:** 不在 Sidebar 组件添加任何定位或高度限制

**理由:**
- 问题出在布局容器，不在侧边栏组件本身
- 保持组件职责单一
- 避免在组件内部硬编码布局相关样式

## Risks / Trade-offs

**风险 1: 内容高度不足时的布局问题**
- **描述:** 如果内容不足，底部可能出现空白
- **缓解:** 现有的 `flex-1` 和 `min-h-screen` 的组合已经处理了这种情况
- **验证:** 需要测试内容较少的页面（如空订阅列表）

**风险 2: 浏览器兼容性**
- **描述:** `h-screen` 在某些旧浏览器中可能不支持
- **缓解:** Tailwind CSS 的 `h-screen` 使用标准的 `height: 100vh`，兼容性良好
- **验证:** 主流现代浏览器均支持

**风险 3: 浏览器地址栏影响**
- **描述:** 移动端浏览器地址栏的显示/隐藏可能影响 `100vh` 的实际高度
- **缓解:** 仅桌面端显示侧边栏（`hidden md:flex`），移动端不受影响
- **验证:** 移动端保持使用抽屉导航，不涉及此问题

## Migration Plan

1. 修改 `app/(dashboard)/layout.tsx` 的根容器 className
2. 本地测试验证：
   - 滚动 items 页面，确认侧边栏保持可见
   - 访问 feeds 页面，确认布局正常
   - 切换到移动端视图，确认抽屉导航正常
3. 运行类型检查：`pnpm exec tsc --noEmit`
4. 运行测试：`pnpm test`

**回滚策略:**
如果发现任何问题，只需将 `h-screen` 改回 `min-h-screen` 即可回滚

## Open Questions

无。此变更范围明确，技术方案简单，无需进一步决策。
