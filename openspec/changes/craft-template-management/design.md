## Context

re-flow 已有 AI 配置管理功能，用户可配置多个 AI 供应商并设置默认配置。本功能在此基础上新增工艺模板层，让用户能够创建可复用的 Prompt 模板并关联到特定 AI 配置。

### 当前架构

- **数据库**: Drizzle ORM + SQLite，已有 `ai_configs` 表
- **API**: `/api/ai-configs` 提供 CRUD 端点
- **前端**: `/settings/ai` 页面，使用 Client Component + React Hook Form

## Goals / Non-Goals

**Goals:**
- 创建 `craft_templates` 数据库表
- 实现工艺模板完整 CRUD
- 提供预设模板库供用户复制使用
- 实现 Prompt 编辑器（带变量提示）
- 实现 AI Config 删除保护

**Non-Goals:**
- 不实现模板测试功能（Phase 2）
- 不实现管道管理（Feature 2）
- 不实现文章处理功能（Feature 3）

## Decisions

### D1: 数据库设计

**决策**: 创建 `craft_templates` 表，关联 `ai_configs` 表

```typescript
craftTemplates = sqliteTable('craft_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  aiConfigId: integer('ai_config_id').notNull().references(() => aiConfigs.id, { onDelete: 'restrict' }),
  promptTemplate: text('prompt_template').notNull(),
  category: text('category').notNull().default('custom'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})
```

**理由**: 使用 `onDelete: 'restrict'` 防止删除有关联模板的 AI Config，配合 API 层的预检查提供友好错误提示。

### D2: 预设模板存储

**决策**: 预设模板在代码中定义（常量数组），用户使用时复制到自己的模板列表

**理由**:
- 预设模板保持干净不可修改
- 用户可自由修改复制后的版本
- 无需额外的数据库表
- 便于版本控制和更新

### D3: Prompt 变量系统

**决策**: 支持 `{{variable}}` 语法，提供 8 个变量

| 变量 | 来源 | 说明 |
|------|------|------|
| `{{title}}` | RSS Item | 文章标题 |
| `{{content}}` | RSS Item | 文章内容（原始 HTML） |
| `{{author}}` | RSS Item | 作者 |
| `{{link}}` | RSS Item | 原文链接 |
| `{{publishedAt}}` | RSS Item | 发布时间 |
| `{{readingTime}}` | RSS Item | 预计阅读时长 |
| `{{feedTitle}}` | Feed | 订阅源名称 |
| `{{feedUrl}}` | Feed | 订阅源地址 |

### D4: 组件架构

**决策**: 使用 Client Component + React Hook Form，复用现有 UI 组件

**页面结构**:
```
/settings/craft          - 模板列表页（Client Component）
/settings/craft/new      - 创建模板页（Client Component，表单）
/settings/craft/[id]/edit - 编辑模板页（Client Component，复用表单）
```

**组件清单**:
- `CraftTemplateList` - 模板列表
- `CraftTemplateCard` - 模板卡片
- `CraftTemplateForm` - 创建/编辑表单
- `PromptEditor` - Prompt 编辑器（带变量提示）
- `PresetTemplateGallery` - 预设模板库弹窗

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 用户复制预设模板后，预设模板更新不会同步 | 接受此限制，用户可随时重新复制 |
| AI Config 删除保护可能导致用户困惑 | API 返回友好提示，列出关联的模板名称 |
| Prompt 变量拼写错误 | 编辑器提供变量提示和自动补全 |
