## Context

工艺模板系统已完成，用户可创建单个 AI 处理模板。本功能在此基础上新增管道层，让用户能够将多个模板按顺序组合成处理流程。

### 当前架构

- **数据库**: 已有 `craft_templates` 表
- **API**: `/api/craft-templates` 提供 CRUD 端点
- **前端**: `/settings/craft` 页面

## Goals / Non-Goals

**Goals:**
- 创建 `pipelines` 数据库表
- 实现管道完整 CRUD
- 实现步骤编辑器（选择模板、拖拽排序）
- 实现管道可视化展示

**Non-Goals:**
- 不实现管道测试功能（Phase 2）
- 不实现文章处理功能（Feature 3）
- 不实现管道执行逻辑（Feature 3）

## Decisions

### D1: 数据库设计

**决策**: 创建 `pipelines` 表，步骤以 JSON 数组存储

```typescript
pipelines = sqliteTable('pipelines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  steps: text('steps').notNull(), // JSON 数组
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
})
```

**步骤 JSON 格式**:
```json
[
  { "templateId": 1, "order": 0, "name": "摘要" },
  { "templateId": 2, "order": 1, "name": "翻译" }
]
```

**理由**:
- 步骤顺序变化频率低，JSON 存储简化设计
- 存储 `name` 快照避免模板重命名后显示问题
- 无需独立 `pipeline_steps` 表

### D2: 拖拽库选择

**决策**: 使用 @dnd-kit 实现步骤拖拽排序

**理由**:
- 现代化 API，支持 React 18+
- 无依赖冲突，轻量级
- 良好的可访问性支持

### D3: 组件架构

**页面结构**:
```
/settings/pipelines          - 管道列表页（Client Component）
/settings/pipelines/new      - 创建管道页（Client Component，编辑器）
/settings/pipelines/[id]/edit - 编辑管道页（Client Component，复用编辑器）
```

**组件清单**:
- `PipelineList` - 管道列表
- `PipelineCard` - 管道卡片
- `PipelineEditor` - 管道编辑器（可视化步骤编排）
- `PipelineStepItem` - 步骤项（可拖拽）
- `TemplateSelector` - 模板选择器（添加步骤用）

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 模板被删除后管道引用失效 | 显示"已删除模板"占位，允许用户移除该步骤 |
| 步骤 JSON 格式变更 | 版本化存储，迁移时升级格式 |
| 大量步骤时拖拽性能 | 限制最多 10 个步骤 |
