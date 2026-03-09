## 1. 修复前端时间戳显示

### 1.1 修复 FeedCard 时间显示

- [x] 1.1.1 编写手工测试用例 FeedCard：验证"最后更新"时间显示正确（Given/When/Then 验收场景）
- [x] 1.1.2 修复 components/feeds/FeedCard.tsx 的 formatDate 函数，将时间戳乘以 1000
- [x] 1.1.3 手工验证 FeedCard：访问 /feeds 页面，确认订阅卡片的"最后更新"时间显示为当前日期（如 2026-03-09），而非 1970-01-21

### 1.2 修复 ItemCard 时间显示

- [x] 1.2.1 编写手工测试用例 ItemCard：验证文章发布时间显示正确（Given/When/Then 验收场景）
- [x] 1.2.2 修复 components/items/ItemCard.tsx 的 formatDate 函数，将时间戳乘以 1000
- [x] 1.2.3 手工验证 ItemCard：访问 /items 页面，确认文章列表的发布时间显示为正确日期，而非 1970 年

### 1.3 修复 CraftTemplateCard 时间显示

- [x] 1.3.1 编写手工测试用例 CraftTemplateCard：验证模板创建时间显示正确（Given/When/Then 验收场景）
- [x] 1.3.2 修复 components/craft/CraftTemplateCard.tsx，将 template.createdAt 乘以 1000
- [x] 1.3.3 手工验证 CraftTemplateCard：访问 /settings/craft 页面，确认模板卡片的"创建于"时间显示为正确日期

### 1.4 同步 Mock 数据格式

- [x] 1.4.1 修改 lib/mock-data.ts，将时间戳格式从毫级改为秒级（除以 1000）

## 2. 代码质量检查

### 2.1 ESLint 检查

- [x] 2.1.1 运行 pnpm lint 并确认无 error（无新增 warning）

### 2.2 类型检查

- [x] 2.2.1 运行 pnpm exec tsc --noEmit 确认零类型错误
