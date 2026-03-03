## Context

### 当前状态

`ItemCard` 组件将文章卡片包裹在 `<Link href="/items/${item.id}">` 中，这使得整个卡片（包括收藏和已读/未读切换按钮）都成为可点击的导航区域。当用户点击这些按钮时，React 事件冒泡会触发父级 Link 的导航行为，导致用户意外跳转到文章详情页。

### 受影响的组件结构

```
ItemCard.tsx
├── <Link href="/items/${item.id}">
│   ├── 文章内容（标题、摘要、元信息）
│   └── 操作按钮区域
│       ├── <ReadToggleButton />  ← 点击会触发导航
│       └── <FavoriteButton />    ← 点击会触发导航
```

### 技术约束

- 使用 Next.js 16 App Router 的 Link 组件
- React 19 事件系统
- TypeScript 5 严格模式
- 需要确保类型安全，无 `any` 类型

## Goals / Non-Goals

**Goals:**
- 点击收藏按钮时仅切换收藏状态，保持在当前页面
- 点击已读/未读切换按钮时仅切换阅读状态，保持在当前页面
- 保持现有的 UI 布局和样式不变
- 确保组件的类型安全

**Non-Goals:**
- 不改变 ItemCard 的整体布局结构
- 不改变按钮的样式或交互反馈
- 不影响文章详情页（ItemContent）中按钮的行为
- 不修改任何后端 API

## Decisions

### 决策 1：使用 `event.stopPropagation()` 阻止事件冒泡

**方案：** 在按钮的 `onClick` 处理函数中调用 `e.stopPropagation()`

**理由：**
- 最小化代码变更，只需修改两个组件的内部逻辑
- 不影响 ItemCard 的结构和布局
- 不需要重构 ItemCard 组件
- React 19 事件传播行为稳定可靠

**实现方式：**
```typescript
const handleToggle = async (e: React.MouseEvent) => {
  e.stopPropagation(); // 阻止事件冒泡到 Link 组件
  setLoading(true);
  // ... 现有逻辑
};

return (
  <Button onClick={handleToggle}>
    {/* 按钮内容 */}
  </Button>
);
```

### 决策 2：保持 `onUpdate` 回调机制

**方案：** 继续支持 `onUpdate` 可选回调属性

**理由：**
- `ItemCard` 可能需要监听按钮状态变化来更新本地状态
- 现有的 `onUpdate` 机制已经在使用，不应破坏
- 提供更好的灵活性，允许父组件响应状态变化

### 决策 3：不修改 Button 基础组件

**方案：** 不在基础 Button 组件中添加 `stopPropagation` 功能

**理由：**
- 基础组件应该保持纯净，不包含特定的业务逻辑
- `stopPropagation` 是特定场景需求，不应作为默认行为
- 避免影响其他使用 Button 组件的地方

## Risks / Trade-offs

### 风险 1：其他按钮操作可能也需要阻止冒泡

**风险：** 未来可能需要在 ItemCard 中添加更多操作按钮（如分享、删除等），这些按钮也可能需要阻止冒泡。

**缓解措施：** 在组件中添加注释说明 `stopPropagation` 的用途，便于未来开发者理解。如果需要添加更多按钮，可以提取通用的 `stopEventPropagation` 辅助函数。

### 风险 2：可能影响其他使用这两个按钮的地方

**风险：** `FavoriteButton` 和 `ReadToggleButton` 可能在其他场景中被使用，阻止冒泡可能不是所有场景都期望的行为。

**缓解措施：** 检查这两个组件的使用情况。经探索发现，它们仅在 `ItemCard` 和 `ItemContent` 中使用：
- `ItemContent`：按钮不在 Link 内，阻止冒泡无影响
- `ItemCard`：按钮在 Link 内，需要阻止冒泡

因此，在此场景下阻止冒泡是正确的行为。

### 权衡：事件冒泡 vs 显式布局

**选项 A（已选）：** 阻止事件冒泡
- 优点：最小化代码变更，保持现有布局
- 缺点：依赖事件传播机制，不够显式

**选项 B（未选）：** 将按钮移到 Link 外部
- 优点：更清晰的语义和结构
- 缺点：需要调整布局和样式，增加变更范围

**选择选项 A 的理由：** 这是一次 bug 修复，应尽量减少变更范围。阻止事件冒泡是解决此问题的标准做法。

## Migration Plan

### 部署步骤

1. 修改 `components/items/FavoriteButton.tsx`
2. 修改 `components/items/ReadToggleButton.tsx`
3. 运行类型检查：`pnpm exec tsc --noEmit`
4. 运行测试：`pnpm test`

### 回滚策略

由于只是修改客户端组件的点击事件处理，不涉及数据模型或 API 变更：
- 如果发现任何问题，可以直接回滚代码修改
- 无需数据库迁移或服务端变更

## Open Questions

无
