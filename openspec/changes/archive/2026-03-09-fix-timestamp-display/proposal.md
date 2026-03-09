## Why

用户报告 feeds 页面订阅卡片中显示最后更新时间一直显示 1970/1/21，无论怎么更新都不变。经调查发现，数据库中存储的是秒级 Unix 时间戳，但前端 `new Date()` 构造函数期望毫级时间戳，导致时间被缩小 1000 倍。

## What Changes

- 修改 `components/feeds/FeedCard.tsx` 的 `formatDate` 函数，将时间戳乘以 1000
- 修改 `components/items/ItemCard.tsx` 的 `formatDate` 函数，将时间戳乘以 1000
- 修改 `components/craft/CraftTemplateCard.tsx`，将 `template.createdAt` 乘以 1000

## Capabilities

### New Capabilities

无（纯 bug 修复，不引入新能力）

### Modified Capabilities

无（仅修复前端显示逻辑，不修改 API 或数据结构）

## Impact

**影响范围**：
- `components/feeds/FeedCard.tsx` - 修复 `lastUpdatedAt` 显示
- `components/items/ItemCard.tsx` - 修复 `publishedAt` 显示
- `components/craft/CraftTemplateCard.tsx` - 修复 `createdAt` 显示

**不影响的范围**：
- 数据库 schema（时间戳存储方式不变）
- API 路由（继续返回秒级时间戳）
- 后端逻辑（worker 已正确处理时间戳转换）
- `PipelineCard.tsx`（已正确实现 `createdAt * 1000`）
