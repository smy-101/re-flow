## Why

在 items 等内容较多的页面滚动时，左侧边栏会随页面滚动而消失，导致导航按钮不可用。当前布局使用 `min-h-screen`，当内容超过视口高度时，整个页面滚动，而只有顶栏有 `sticky` 定位，导致侧边栏被滚出视口。

## What Changes

- 修改 `app/(dashboard)/layout.tsx` 的根容器从 `min-h-screen` 改为 `h-screen`
- 确保侧边栏和主内容区域在固定视口内，滚动仅在 `main` 元素内部发生

## Capabilities

### New Capabilities
- `fixed-viewport-layout`: 固定视口布局，侧边栏和主内容在视口内，滚动仅在内容区域

### Modified Capabilities
- 无

## Impact

- 修改文件：`app/(dashboard)/layout.tsx`
- 影响范围：所有使用 dashboard 布局的页面（feeds、items、favorites 等）
- 行为变更：页面不再随内容滚动，仅在主内容区域内部滚动
